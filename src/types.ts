/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppScreen {
  WELCOME = "WELCOME",
  K3LH = "K3LH",
  DASHBOARD = "DASHBOARD",
  MODULE1 = "MODULE1",
  MODULE2 = "MODULE2",
  MODULE3 = "MODULE3",
  EVALUATION = "EVALUATION",
  CREATOR = "CREATOR",
  TEACHER = "TEACHER"
}

export interface StudentInfo {
  name: string;
  classRoom: string;
  joinedAt: string;
  sessionToken?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ToolDescription {
  id: string;
  name: string;
  localName: string;
  functionDesc: string;
  safetyCaution: string;
  technicalSpecs: string;
  iconName: string; // references to SVG patterns
}

export interface ModuleProgress {
  m1Completed: boolean;
  m2Completed: boolean;
  m3Completed: boolean;
  quizCompleted: boolean;
  quizScore: number;
}
