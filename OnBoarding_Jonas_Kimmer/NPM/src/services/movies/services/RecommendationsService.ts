/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RecommendationsService {

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsTest(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/test',
        });
    }

    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsDebugAnalyze(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/debug/analyze',
        });
    }

    /**
     * @param count 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsDebugSimple(
count: number = 3,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/debug/simple',
            query: {
                'count': count,
            },
        });
    }

    /**
     * @param movieId 
     * @param count 
     * @param type 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsMovie(
movieId: number,
count: number = 4,
type: string = 'actors',
): CancelablePromise<Array<any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/movie/{movieId}',
            path: {
                'movieId': movieId,
            },
            query: {
                'count': count,
                'type': type,
            },
        });
    }

    /**
     * @param count 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsPopular(
count: number = 4,
): CancelablePromise<Array<any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/popular',
            query: {
                'count': count,
            },
        });
    }

    /**
     * @param limit 
     * @returns any OK
     * @throws ApiError
     */
    public static getApiRecommendationsDebugNeo4JMovies(
limit: number = 10,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Recommendations/debug/neo4j-movies',
            query: {
                'limit': limit,
            },
        });
    }

}
