import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestHeaders } from 'axios';

@Injectable()
export class GenresService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getAllGenres(): Observable<AxiosResponse<string[]>> {
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${this.configService.get('TOKEN_SPOTIFY')}`,
    };
    return this.httpService
      .get(`/recommendations/available-genre-seeds`, {
        headers,
      })
      .pipe(map((response) => response.data.genres));
  }
}
