import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';

//export interface ActionBase {
//  type: string;
//}

export type counterStateType = {
  counter: number;
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<
  counterStateType | projectStateType,
  Action<string>
>;
