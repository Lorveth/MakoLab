import { Routes } from '@angular/router';
import { JsConcurrencyExerciseComponent } from './exercises/1-js-concurrency-exercise/components/js-concurrency-exercise/js-concurrency-exercise.component';
import { TheLicensePlateProblemComponent } from './exercises/2-the-license-plate-problem/the-license-plate-problem.component';

export const routes: Routes = [
  {
    path: 'exercise1',
    component: JsConcurrencyExerciseComponent,
  },
  {
    path: 'exercise2',
    component: TheLicensePlateProblemComponent,
  },
];
