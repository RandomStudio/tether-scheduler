export enum OperationMode {
  SCHEDULED = "scheduled",
  MANUAL = "manual"
};

export interface Time {
  hours: number;
  minutes: number;
};

export interface Timing {
  dayOfTheWeek: number;
  startTime: Time;
  endTime: Time;
  enabled: boolean;
};

export interface SchedulerState {
  operationMode: OperationMode;
  on: boolean;
  timings: Timing[];
};