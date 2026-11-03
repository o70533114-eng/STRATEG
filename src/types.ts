export type NodeStatus = 'fact' | 'assumption' | 'hypothesis' | 'conclusion';

export type ChainNodeType = 
  | 'problem' 
  | 'fact' 
  | 'cause' 
  | 'cause_check' 
  | 'conclusion' 
  | 'solution' 
  | 'validation';

export interface LogicalChainItem {
  id: string;
  type: ChainNodeType;
  title: string;
  content: string;
  evidence: string;
  status: NodeStatus;
  parentId?: string | null;
  missingData: string;
  counterArguments: string;
}

export interface MetricRating {
  score: number; // 1-10
  justification: string;
}

export interface ProblemPrioritization {
  scaleNegativeConsequences: MetricRating;
  impactOnGoals: MetricRating;
  urgency: MetricRating;
  potentialEffect: MetricRating;
  requiredResources: MetricRating; // 1 = light, 10 = huge
  costOfInaction: MetricRating;
  dataConfidence: MetricRating;
  totalPriorityScore: number;
  totalPrioritySummary: string;
  uncertaintyNotes: string;
}

export interface SolutionOption {
  id: string;
  name: string;
  impactMechanism: string;
  expectedResult: string;
  actions: string[];
  costsAndResources: string;
  risks: string;
  constraints: string;
  kpis: string;
  verificationMethod: string;
  isRecommended: boolean;
  recommendationReason?: string;
}

export interface ValidationPlan {
  expectedResult: string;
  baselineMetrics: string;
  exactChange: string;
  duration: string;
  postMetrics: string;
  confoundingFactors: string;
  decisionCriteria: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredMeta?: {
    summaryOfLastAnswer?: string;
    establishedFacts?: string[];
    missingData?: string[];
    assumptions?: string[];
    logicalCritique?: string;
    nextQuestion?: string;
  };
}

export type ProjectStage = 
  | 'interview' 
  | 'chain' 
  | 'prioritization' 
  | 'solutions' 
  | 'validation' 
  | 'report';

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  companyName: string;
  industry: string;
  scale: string;
  initialProblem: string;
  desiredOutcome: string;
  currentStage: ProjectStage;
  chatMessages: ChatMessage[];
  establishedFacts: string[];
  missingData: string[];
  assumptions: string[];
  logicalChain: LogicalChainItem[];
  prioritization?: ProblemPrioritization;
  solutions: SolutionOption[];
  selectedSolutionId?: string;
  validationPlan?: ValidationPlan;
  finalReportSummary?: string;
}
