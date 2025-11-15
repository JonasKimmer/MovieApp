/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MoviesService {

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMovies(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies',
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMovies1(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMoviesActors(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/{id}/actors',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMoviesMainActor(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/{id}/main-actor',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMoviesDirectors(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/{id}/directors',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static postApiMoviesFavorite(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Movies/{id}/favorite',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiMoviesFavorite(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Movies/{id}/favorite',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns any OK
     * @throws ApiError
     */
    public static postApiMoviesRating(
id: number,
requestBody?: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Movies/{id}/rating',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiMoviesRating(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Movies/{id}/rating',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMoviesFavorites(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/favorites',
        });
    }

    /**
     * @param id 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiMoviesMainActorName(
id: number,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Movies/{id}/main-actor-name',
            path: {
                'id': id,
            },
        });
    }

}
