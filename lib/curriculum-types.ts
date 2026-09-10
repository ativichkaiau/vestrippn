export interface ExamData {
  id: string;
  courseId: string;
  title: string;
  scheduledAt: string;
}

export interface CourseData {
  id: string;
  semesterId: string;
  code: string;
  name: string;
  canvasCourseId: string | null;
  canvasUrl: string | null;
  notebookUrl: string | null;
  sortOrder: number;
  exams: ExamData[];
}

export interface SemesterData {
  id: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  archivedAt: string | null;
  courses: CourseData[];
}

export interface ActiveExamData extends ExamData {
  name: string;
  fullName: string;
}

export interface CurriculumData { semesters: SemesterData[] }

// Bangkok has no daylight-saving transitions. Use this fixed offset for the
// datetime-local editor, independent of the device's own time zone.
export function bangkokInputValue(iso: string): string {
  return new Date(new Date(iso).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function formatExamDate(iso: string | Date): string {
  return new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Asia/Bangkok', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
