import { ChangeDetectionStrategy, Component, effect, OnInit, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, of } from 'rxjs';
import { IResponse } from '../../interfaces/response.interface';
import { IUrl } from '../../interfaces/url.interface';

@Component({
  selector: 'app-js-concurrency-exercise',
  imports: [],
  templateUrl: './js-concurrency-exercise.component.html',
  styleUrl: './js-concurrency-exercise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsConcurrencyExerciseComponent implements OnInit {
  public responses: WritableSignal<Object[]> = signal([]);

  private urls: string[] = [
    'https://petstore.swagger.io/v2/pet/1',
    'https://jsonplaceholder.typicode.com/posts',
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/todos',
    'https://jsonplaceholder.typicode.com/albumsss',
    'https://jsonplaceholder.typicode.com/comments',
    'https://dummyjson.com/products',
    'https://dummyjson.com/users',
    'https://pokeapi.co/api/v2/pokemon/ditto',
    'https://catfact.ninja/fact',
  ];

  constructor(private httpClient: HttpClient) {
    effect(() => {
      console.log(this.responses());
    });
  }

  ngOnInit() {
    const responses: Object[] = [];
    this.fetchUrls(this.urls, 2).subscribe({
      next: ({ response, index }) => (responses[index] = response),
      complete: () => this.responses.set(responses),
    });
  }

  public fetchUrls(urls: string[], maxConcurrency: number): Observable<IResponse> {
    return from(urls.map((url: string, index: number): IUrl => ({ url, index }))).pipe(
      mergeMap(
        ({ url, index }: IUrl): Observable<IResponse> =>
          this.httpClient.get(url).pipe(
            map((response: Object): IResponse => ({ response, index })),
            catchError((err: HttpErrorResponse) => of({ response: { error: err.message }, index })),
          ),
        maxConcurrency,
      ),
    );
  }
}
