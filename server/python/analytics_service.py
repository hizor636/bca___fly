import os
import sys
import json
import urllib.request
import urllib.parse
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = make_response()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return res

API_BASE_URL = os.environ.get('API_BASE_URL', 'http://localhost:5000')

def query_postgres(sql, params=None):
    """
    Executes SQL directly against the live BCAFly PostgreSQL backend via internal API query console.
    Returns a pandas DataFrame.
    """
    url = f"{API_BASE_URL}/api/db/query"
    payload = json.dumps({'sql': sql, 'params': params or []}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('success') and 'rows' in data:
                return pd.DataFrame(data['rows'])
            return pd.DataFrame()
    except Exception as e:
        print(f"[Python Analytics] Database query failed: {e}", file=sys.stderr)
        return None

# 1. Health & Engine Status
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'engine': 'Python 3.12 (Flask + Pandas + NumPy AI Engine)'
    })

# 2. Predictive Attendance Shortage Forecaster (Pandas/NumPy)
@app.route('/analytics/attendance/forecast', methods=['POST'])
def forecast_attendance():
    """
    Computes trajectory modeling for a student's attendance.
    Calculates exact remaining classes and minimum attendance needed to reach/maintain >= 75%.
    """
    data = request.json or {}
    student_id = data.get('studentId')
    total_planned_classes = data.get('totalPlannedClasses', 60)
    
    try:
        df = query_postgres("SELECT * FROM students WHERE id = $1 OR student_id = $2", [student_id, student_id])
        if df is None:
            return jsonify({'error': 'Database unavailable'}), 500
        if df.empty:
            return jsonify({'error': 'Student not found'}), 404
        
        row = df.iloc[0]
        attended = int(row.get('total_classes_attended', 0) or 0)
        held = int(row.get('total_classes_held', 0) or 0)
        
        # If held is 0, estimate from weekly attendance or rate
        if held == 0:
            rate = float(row.get('attendance_rate', 75.0) or 75.0)
            held = 30
            attended = int(round((rate / 100.0) * held))
        
        current_rate = float((attended / held) * 100.0) if held > 0 else 0.0
        remaining_classes = max(0, total_planned_classes - held)
        
        # Required to reach 75% at end of semester
        min_needed = int(np.ceil(0.75 * total_planned_classes - attended))
        min_needed = max(0, min_needed)
        
        # Maximum possible attendance if 100% attended in remaining
        max_possible_rate = float(((attended + remaining_classes) / total_planned_classes) * 100.0) if total_planned_classes > 0 else 0.0
        
        # Trajectory risk category
        if current_rate >= 85.0:
            risk_level = 'Low / Safe'
            status_color = 'emerald'
        elif current_rate >= 75.0:
            risk_level = 'Moderate / Watch'
            status_color = 'amber'
        elif max_possible_rate >= 75.0:
            risk_level = 'High / Shortage Recoverable'
            status_color = 'orange'
        else:
            risk_level = 'Critical / Unrecoverable Without Condonation'
            status_color = 'rose'
            
        return jsonify({
            'success': True,
            'studentId': row.get('student_id', ''),
            'name': row.get('name', ''),
            'semester': int(row.get('semester', 1) or 1),
            'currentAttendancePercent': round(current_rate, 2),
            'classesHeld': held,
            'classesAttended': attended,
            'classesRemaining': remaining_classes,
            'minClassesNeededFor75': min_needed,
            'maxPossibleAttendance': round(max_possible_rate, 2),
            'riskLevel': risk_level,
            'statusColor': status_color,
            'canReachCutoff': max_possible_rate >= 75.0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. Multivariate Academic & Dropout Risk Scoring (Pandas/NumPy)
@app.route('/analytics/risk-matrix', methods=['GET'])
def calculate_risk_matrix():
    """
    Computes a composite risk index (0 - 100) using:
    - Attendance shortfall weight (45%)
    - Internal marks deficit weight (35%)
    - CGPA performance trajectory (20%)
    """
    try:
        students_df = query_postgres("SELECT id, student_id, name, semester, attendance_rate, cgpa, assigned_faculty FROM students")
        marks_df = query_postgres("SELECT student_id, AVG(internal_total) as avg_internal FROM course_marks GROUP BY student_id")
        
        if students_df is None or students_df.empty:
            return jsonify({'success': True, 'riskMatrix': []})
        
        # Merge datasets
        if marks_df is not None and not marks_df.empty:
            merged = pd.merge(students_df, marks_df, left_on='id', right_on='student_id', how='left')
        else:
            merged = students_df.copy()
            merged['avg_internal'] = 21.0
            
        merged['avg_internal'] = merged['avg_internal'].fillna(21.0)
        
        results = []
        for _, row in merged.iterrows():
            att = float(row.get('attendance_rate', 0) or 0)
            cgpa = float(row.get('cgpa', 0) or 0)
            internal = float(row.get('avg_internal', 0) or 0)
            
            # Sub-scores (0 to 100, higher means greater risk)
            att_risk = max(0.0, min(100.0, (75.0 - att) * 4.0)) if att < 75.0 else 0.0
            grade_risk = max(0.0, min(100.0, (7.0 - cgpa) * 25.0)) if cgpa < 7.0 else 0.0
            internal_risk = max(0.0, min(100.0, (18.0 - internal) * 8.0)) if internal < 18.0 else 0.0
            
            composite_score = round(0.45 * att_risk + 0.35 * internal_risk + 0.20 * grade_risk, 1)
            
            if composite_score >= 60.0:
                tier = 'Urgent Intervention'
            elif composite_score >= 30.0:
                tier = 'Academic Concern'
            else:
                tier = 'Normal Progress'
                
            student_id_val = row.get('student_id_x', row.get('student_id', ''))
            results.append({
                'id': row.get('id', ''),
                'studentId': student_id_val,
                'name': row.get('name', ''),
                'semester': int(row.get('semester', 1) or 1),
                'assignedFaculty': row.get('assigned_faculty', ''),
                'attendanceRate': att,
                'cgpa': cgpa,
                'avgInternalMarks': round(internal, 1),
                'riskScore': composite_score,
                'riskTier': tier
            })
            
        results.sort(key=lambda x: x['riskScore'], reverse=True)
        return jsonify({
            'success': True,
            'totalEvaluated': len(results),
            'highRiskCount': len([r for r in results if r['riskScore'] >= 30.0]),
            'riskMatrix': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. Cohort Statistical Distribution (NumPy Quartiles, Mean, Standard Deviation)
@app.route('/analytics/cohort-stats', methods=['GET'])
def cohort_statistics():
    try:
        df = query_postgres("SELECT semester, attendance_rate, cgpa FROM students WHERE attendance_rate > 0")
        if df is None or df.empty:
            return jsonify({'success': True, 'stats': {}})
        
        cohort_data = {}
        for sem in sorted(df['semester'].unique()):
            sem_df = df[df['semester'] == sem]
            att_series = sem_df['attendance_rate'].astype(float).to_numpy()
            cgpa_series = sem_df['cgpa'].astype(float).to_numpy()
            
            cohort_data[f'Semester_{sem}'] = {
                'enrolledCount': int(len(sem_df)),
                'attendance': {
                    'mean': round(float(np.mean(att_series)), 2),
                    'median': round(float(np.median(att_series)), 2),
                    'stdDev': round(float(np.std(att_series)), 2),
                    'min': round(float(np.min(att_series)), 2),
                    'max': round(float(np.max(att_series)), 2),
                    'q25': round(float(np.percentile(att_series, 25)), 2),
                    'q75': round(float(np.percentile(att_series, 75)), 2),
                    'shortagePercent': round(float((np.sum(att_series < 75.0) / len(att_series)) * 100.0), 1)
                },
                'cgpa': {
                    'mean': round(float(np.mean(cgpa_series)), 2),
                    'median': round(float(np.median(cgpa_series)), 2),
                    'stdDev': round(float(np.std(cgpa_series)), 2),
                    'min': round(float(np.min(cgpa_series)), 2),
                    'max': round(float(np.max(cgpa_series)), 2)
                }
            }
            
        return jsonify({
            'success': True,
            'generatedAt': pd.Timestamp.now().isoformat(),
            'cohortStats': cohort_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 5. AI Mentoring Action & SMS Recommendation Engine
@app.route('/analytics/ai-mentoring-prompt', methods=['POST'])
def generate_ai_mentoring_advice():
    data = request.json or {}
    name = data.get('name', 'Student')
    att = float(data.get('attendanceRate', 75.0))
    cgpa = float(data.get('cgpa', 7.0))
    semester = data.get('semester', 5)
    
    # Automated analytical rule engine + structured AI output
    if att < 75.0 and cgpa < 6.5:
        primary_concern = "Compounded Shortage & Academic Underperformance"
        suggested_action = "Schedule compulsory 1-on-1 mentor session, issue formal shortage advisory letter, and assign remedial catch-up labs."
        sms_draft = f"BCAFly Alert: Dear Parent, {name} (Sem {semester}) attendance is currently {att}% and requires immediate academic review. Please contact mentor faculty."
    elif att < 75.0:
        primary_concern = "Attendance Shortage (<75% Threshold)"
        suggested_action = "Warn student of exam eligibility cutoff (Regulation 4.2). Require daily check-in with faculty mentor."
        sms_draft = f"BCAFly Notice: Dear Student {name}, your attendance ({att}%) has fallen below the 75% exam cutoff. Submit condonation documentation if eligible."
    elif cgpa >= 8.5:
        primary_concern = "Honor Roll & Career Advancement"
        suggested_action = "Encourage participation in hackathons, research publications, and recommend for capstone project leadership."
        sms_draft = f"BCAFly Recognition: Congratulations {name}! You have maintained Honor Roll standing with a CGPA of {cgpa}. Keep up the excellent work."
    else:
        primary_concern = "Steady Academic Progress"
        suggested_action = "Review upcoming semester course elective selections and confirm mid-term internal submission."
        sms_draft = f"BCAFly Update: {name} (Sem {semester}) is maintaining satisfactory academic standing (Attendance: {att}%, CGPA: {cgpa})."
        
    return jsonify({
        'success': True,
        'studentName': name,
        'primaryConcern': primary_concern,
        'suggestedAction': suggested_action,
        'recommendedSmsDraft': sms_draft
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"[Python AI Engine] BCAFly Python AI & Analytics Service listening on http://localhost:{port} (PostgreSQL backend)")
    app.run(host='0.0.0.0', port=port, debug=False)
