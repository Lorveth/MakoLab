import { TestBed } from '@angular/core/testing';
import { JsConcurrencyExerciseComponent } from './js-concurrency-exercise.component';
import { HttpClient } from '@angular/common/http';
import { TestScheduler } from 'rxjs/testing';
import { CommonModule } from '@angular/common';
import { Observable, tap } from 'rxjs';

describe('JsConcurrencyExerciseComponent', () => {
  let component: JsConcurrencyExerciseComponent;
  let fixture: any;
  let httpMock: jasmine.SpyObj<HttpClient>;
  let testScheduler: TestScheduler;

  const urls = [
    'http://api/1',
    'http://api/2',
    'http://api/3',
    'http://api/4',
    'http://api/5',
    'http://api/6',
    'http://api/7',
    'http://api/8',
  ];

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      imports: [CommonModule, JsConcurrencyExerciseComponent],
      providers: [{ provide: HttpClient, useValue: httpClientSpy }],
    });

    fixture = TestBed.createComponent(JsConcurrencyExerciseComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should return all responses for 8 addresses (2 with error) with maxConcurrency=3', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const responses = {
        'http://api/1': cold('--a|', { a: { data: 1 } }),
        'http://api/2': cold('----#', {}, new Error('server error')),
        'http://api/3': cold('-a|', { a: { data: 3 } }),
        'http://api/4': cold('---a|', { a: { data: 4 } }),
        'http://api/5': cold('-----a|', { a: { data: 5 } }),
        'http://api/6': cold('--#', {}, new Error('not found')),
        'http://api/7': cold('-a|', { a: { data: 7 } }),
        'http://api/8': cold('----a|', { a: { data: 8 } }),
      };

      // @ts-ignore
      httpMock.get.and.callFake((url: string) => responses[url]);

      const expectedMarble = '-ab-cdefg-h|';

      const expectedValues = {
        a: { response: { data: 3 }, index: 2 },
        b: { response: { data: 1 }, index: 0 },
        c: { response: { error: 'server error' }, index: 1 },
        d: { response: { data: 4 }, index: 3 },
        e: { response: { error: 'not found' }, index: 5 },
        f: { response: { data: 7 }, index: 6 },
        g: { response: { data: 5 }, index: 4 },
        h: { response: { data: 8 }, index: 7 },
      };

      const maxConcurrency = 3;

      const result$ = component.fetchUrls(urls, maxConcurrency).pipe(tap((x) => console.log(testScheduler.now(), x)));

      expectObservable(result$).toBe(expectedMarble, expectedValues);
    });
  });

  it('should does not exceed maxConcurrency at any time', () => {
    testScheduler.run(({ cold, expectObservable, flush }) => {
      const responses = {
        'http://api/1': cold('--a|', { a: { data: 1 } }),
        'http://api/2': cold('----#', {}, new Error('server error')),
        'http://api/3': cold('-a|', { a: { data: 3 } }),
        'http://api/4': cold('---a|', { a: { data: 4 } }),
        'http://api/5': cold('-----a|', { a: { data: 5 } }),
        'http://api/6': cold('--#', {}, new Error('not found')),
        'http://api/7': cold('-a|', { a: { data: 7 } }),
        'http://api/8': cold('----a|', { a: { data: 8 } }),
      };

      let concurrent = 0;
      let maxObserved = 0;

      (httpMock.get as jasmine.Spy).and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          concurrent++;
          if (concurrent > maxObserved) {
            maxObserved = concurrent;
          }
          // @ts-ignore
          const sub = responses[url].subscribe({
            next: (val: unknown) => observer.next(val),
            error: (err: any) => observer.error(err),
            complete: () => observer.complete(),
          });
          return () => {
            concurrent--;
            sub.unsubscribe();
          };
        });
      });

      component.fetchUrls(urls, 2).subscribe();

      flush();
      expect(maxObserved).toBeLessThanOrEqual(2);
    });
  });
});
