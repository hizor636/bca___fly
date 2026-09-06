"""
BcaFly Academic Intelligence & Forecast Engine
High-performance predictive analytics using Pandas, NumPy, and Scikit-Learn.
"""

from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd


class AttendanceForecaster:
    """Predictive trajectory forecaster for student classroom attendance."""

    @staticmethod
    def forecast_student_attendance(
        attended_classes: int,
        total_conducted: int,
        total_planned_semester: int = 90,
        recent_trend: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates:
        1. Current attendance %
        2. Classes required to reach 75% regulatory threshold
        3. Maximum permissible future absences before falling below 75%
        4. Linear trajectory trend forecasting final projected %
        5. Risk tier: CRITICAL (<65%), WARNING (65-74.9%), SAFE (>=75%)
        """
        if total_conducted <= 0:
            current_pct = 100.0
        else:
            current_pct = round((attended_classes / total_conducted) * 100.0, 2)

        remaining_classes = max(0, total_planned_semester - total_conducted)

        # Calculate required classes for 75% overall
        # (attended + x) / total_planned >= 0.75 => x >= 0.75 * total_planned - attended
        needed_for_75 = max(0, int(np.ceil(0.75 * total_planned_semester - attended_classes)))

        # Can student reach 75% even with 100% future attendance?
        max_possible_attended = attended_classes + remaining_classes
        max_possible_pct = round((max_possible_attended / total_planned_semester) * 100.0, 2)
        can_reach_75 = max_possible_attended >= (0.75 * total_planned_semester)

        # Max permissible absences while keeping >= 75%
        # (attended + remaining - y) / total_planned >= 0.75 => y <= attended + remaining - 0.75 * total_planned
        max_future_absences = max(0, int(np.floor(attended_classes + remaining_classes - (0.75 * total_planned_semester))))

        # Trajectory forecast based on linear rate or recent trend
        if recent_trend and len(recent_trend) >= 5:
            # Weighted moving average for recent attendance trend (1 = Present, 0 = Absent)
            weights = np.linspace(1, 2, len(recent_trend))
            recent_rate = np.average(recent_trend, weights=weights)
            projected_future_attended = recent_rate * remaining_classes
        else:
            current_rate = (attended_classes / total_conducted) if total_conducted > 0 else 1.0
            projected_future_attended = current_rate * remaining_classes

        projected_final_attended = attended_classes + projected_future_attended
        projected_final_pct = round((projected_final_attended / total_planned_semester) * 100.0, 2)

        # Risk Classification
        if current_pct < 65.0 or (not can_reach_75):
            risk_tier = "CRITICAL"
            risk_color = "#ef4444"
            action_recommended = "Immediate parent-mentor conference & regulatory deficit notice"
        elif current_pct < 75.0 or projected_final_pct < 75.0:
            risk_tier = "WARNING"
            risk_color = "#f59e0b"
            action_recommended = f"Student must attend {needed_for_75} out of remaining {remaining_classes} classes"
        else:
            risk_tier = "SAFE"
            risk_color = "#10b981"
            action_recommended = f"On track. Permissible future absences: {max_future_absences} classes"

        return {
            "current_percentage": current_pct,
            "attended_classes": attended_classes,
            "total_conducted": total_conducted,
            "remaining_classes": remaining_classes,
            "total_planned_semester": total_planned_semester,
            "classes_needed_for_75": needed_for_75,
            "max_possible_percentage": max_possible_pct,
            "can_reach_75": can_reach_75,
            "max_permissible_absences": max_future_absences,
            "projected_final_percentage": projected_final_pct,
            "risk_tier": risk_tier,
            "risk_color": risk_color,
            "action_recommended": action_recommended,
        }


class AcademicRiskClassifier:
    """Multi-factor academic deficiency and correlation scoring."""

    @staticmethod
    def calculate_student_risk_score(
        attendance_pct: float,
        cia_marks_pct: float,
        assignment_submission_rate: float = 100.0,
        mentor_flag_count: int = 0
    ) -> Dict[str, Any]:
        """
        Composite Risk Index (0 to 100, where higher is higher risk):
        - Attendance deficit weight: 40%
        - CIA Marks deficit weight: 40%
        - Assignment non-submission weight: 10%
        - Mentor red flags: 10%
        """
        # Attendance deficit (0 at 100%, 100 at 0%)
        att_deficit = max(0.0, 100.0 - attendance_pct)
        # Marks deficit
        marks_deficit = max(0.0, 100.0 - cia_marks_pct)
        # Assignment deficit
        assign_deficit = max(0.0, 100.0 - assignment_submission_rate)
        # Mentor flags (capped at 5 flags = 100)
        mentor_deficit = min(100.0, mentor_flag_count * 20.0)

        composite_risk_score = round(
            (0.40 * att_deficit) +
            (0.40 * marks_deficit) +
            (0.10 * assign_deficit) +
            (0.10 * mentor_deficit),
            2
        )

        if composite_risk_score >= 40.0:
            category = "HIGH_RISK"
            status_badge = "High Academic Risk"
        elif composite_risk_score >= 20.0:
            category = "MODERATE_RISK"
            status_badge = "Moderate Risk"
        else:
            category = "GOOD_STANDING"
            status_badge = "Good Standing"

        return {
            "composite_risk_score": composite_risk_score,
            "risk_category": category,
            "status_badge": status_badge,
            "breakdown": {
                "attendance_deficit_score": round(att_deficit, 1),
                "marks_deficit_score": round(marks_deficit, 1),
                "assignment_deficit_score": round(assign_deficit, 1),
                "mentor_flag_score": round(mentor_deficit, 1),
            }
        }

    @staticmethod
    def analyze_cohort_summary(records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregates cohort metrics using Pandas DataFrame."""
        if not records:
            return {
                "total_students": 0,
                "average_attendance": 0.0,
                "average_marks": 0.0,
                "shortage_count": 0,
                "distribution": {"safe": 0, "warning": 0, "critical": 0}
            }

        df = pd.DataFrame(records)
        total = len(df)
        avg_att = round(float(df["attendance_percentage"].mean()), 2) if "attendance_percentage" in df else 0.0
        avg_marks = round(float(df["marks_percentage"].mean()), 2) if "marks_percentage" in df else 0.0

        critical_count = int((df["attendance_percentage"] < 65.0).sum()) if "attendance_percentage" in df else 0
        warning_count = int(((df["attendance_percentage"] >= 65.0) & (df["attendance_percentage"] < 75.0)).sum()) if "attendance_percentage" in df else 0
        safe_count = int((df["attendance_percentage"] >= 75.0).sum()) if "attendance_percentage" in df else 0

        # Calculate Pearson correlation between attendance and marks if both exist
        correlation = 0.0
        if "attendance_percentage" in df and "marks_percentage" in df and len(df) > 2:
            corr_matrix = df[["attendance_percentage", "marks_percentage"]].corr()
            val = corr_matrix.loc["attendance_percentage", "marks_percentage"]
            correlation = round(float(val), 3) if not np.isnan(val) else 0.0

        return {
            "total_students": total,
            "average_attendance": avg_att,
            "average_marks": avg_marks,
            "attendance_marks_correlation": correlation,
            "shortage_count": critical_count + warning_count,
            "distribution": {
                "safe": safe_count,
                "warning": warning_count,
                "critical": critical_count,
            },
            "shortage_percentage": round(((critical_count + warning_count) / total) * 100.0, 2) if total > 0 else 0.0
        }
