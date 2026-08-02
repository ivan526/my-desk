export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  category: string;
  tags: string;
  dueDate: string | null;
  completedAt: string | null;
  projectId: string | null;
  isConverted: boolean;
  createdAt: string;
  updatedAt: string;
  project?: Project | null;
  achievement?: Achievement | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed" | "archived";
  priority: "high" | "medium" | "low";
  progress: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  taskId: string | null;
  projectId: string | null;
  scenario: string;
  result: string;
  output: string;
  value: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  task?: Task | null;
  project?: Project | null;
}

export interface DailyNote {
  id: string;
  content: string;
  date: string;
  taskId: string | null;
  mood: string;
  createdAt: string;
  updatedAt: string;
  task?: Task | null;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  projectsCount: number;
  achievementsCount: number;
  summary: string;
  issues: string;
  nextPlan: string;
  isAuto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  tasksCompleted: number;
  projectsCount: number;
  achievementsCount: number;
  collaborationsCount: number;
  summary: string;
  isAuto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  month: string;
  achievementCategories: AchievementCategoryItem[];
  investmentDistribution: InvestmentItem[];
  trends: TrendItem[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementCategoryItem {
  category: string;
  count: number;
}

export interface InvestmentItem {
  category: string;
  percentage: number;
}

export interface TrendItem {
  month: string;
  tasks: number;
  achievements: number;
}

export interface DashboardData {
  todayTasks: Task[];
  todayTaskTotal: number;
  todayTaskDone: number;
  activeProjects: Project[];
  weeklyProgress: number;
  weeklyTasksDone: number;
  weeklyTasksTotal: number;
  monthlyAchievements: Achievement[];
  monthlyAchievementCount: number;
  monthlyTaskCount: number;
  monthlyProjectCount: number;
  keyTasks: Task[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
