"""
BcaFly Academic Intelligence Microservice
FastAPI 0.115+ | Python 3.12+
"""

from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import time

from forecaster import AttendanceForecaster, AcademicRiskClassifier

app = FastAPI(
    title="BcaFly Academic Intelligence Service",
    version="2.0.0",
    description="Microservice for student attendance trajectory forecasting, marks correlation, and academic risk classification."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AttendanceForecastRequest(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    attended_classes: int = Field(..., ge=0, description="Total classes attended by student so far")
    total_conducted: int = Field(..., ge=0, description="Total classes conducted so far")
    total_planned_semester: int = Field(default=90, ge=1, description="Total planned semester classes")
    recent_trend: Optional[List[int]] = Field(default=None, description="Recent attendance binary sequence (1=Present, 0=Absent)")


class BatchAttendanceForecastRequest(BaseModel):
    students: List[AttendanceForecastRequest]


class RiskScoreRequest(BaseModel):
    student_id: Optional[str] = None
    attendance_pct: float = Field(..., ge=0.0, le=100.0)
    cia_marks_pct: float = Field(..., ge=0.0, le=100.0)
    assignment_submission_rate: float = Field(default=100.0, ge=0.0, le=100.0)
    mentor_flag_count: int = Field(default=0, ge=0)


class CohortStudentRecord(BaseModel):
    student_id: Optional[str] = None
    attendance_percentage: float = Field(..., ge=0.0, le=100.0)
    marks_percentage: Optional[float] = Field(default=None, ge=0.0, le=100.0)


class CohortSummaryRequest(BaseModel):
    cohort_id: Optional[str] = "BCA_SEM_ALL"
    records: List[CohortStudentRecord]


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "bcafly-analytics-python",
        "engine": "FastAPI + NumPy / Pandas",
        "timestamp": int(time.time() * 1000),
    }


@app.post("/api/v1/forecast/attendance")
def forecast_single_student(req: AttendanceForecastRequest):
    if req.attended_classes > req.total_conducted:
        raise HTTPException(status_code=400, detail="Attended classes cannot exceed total conducted classes.")

    result = AttendanceForecaster.forecast_student_attendance(
        attended_classes=req.attended_classes,
        total_conducted=req.total_conducted,
        total_planned_semester=req.total_planned_semester,
        recent_trend=req.recent_trend,
    )
    if req.student_id:
        result["student_id"] = req.student_id
    if req.student_name:
        result["student_name"] = req.student_name

    return result


@app.post("/api/v1/forecast/attendance/batch")
def forecast_batch_students(req: BatchAttendanceForecastRequest):
    results = []
    for s in req.students:
        if s.attended_classes > s.total_conducted:
            continue
        res = AttendanceForecaster.forecast_student_attendance(
            attended_classes=s.attended_classes,
            total_conducted=s.total_conducted,
            total_planned_semester=s.total_planned_semester,
            recent_trend=s.recent_trend,
        )
        if s.student_id:
            res["student_id"] = s.student_id
        if s.student_name:
            res["student_name"] = s.student_name
        results.append(res)
    return {"results": results, "count": len(results)}


@app.post("/api/v1/analytics/marks-risk")
def calculate_risk(req: RiskScoreRequest):
    result = AcademicRiskClassifier.calculate_student_risk_score(
        attendance_pct=req.attendance_pct,
        cia_marks_pct=req.cia_marks_pct,
        assignment_submission_rate=req.assignment_submission_rate,
        mentor_flag_count=req.mentor_flag_count,
    )
    if req.student_id:
        result["student_id"] = req.student_id
    return result


@app.post("/api/v1/analytics/cohort-summary")
def summarize_cohort(req: CohortSummaryRequest):
    raw_dicts = [r.model_dump() for r in req.records]
    summary = AcademicRiskClassifier.analyze_cohort_summary(raw_dicts)
    summary["cohort_id"] = req.cohort_id
    return summary


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
