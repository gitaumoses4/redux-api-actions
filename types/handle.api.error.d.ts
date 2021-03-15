import { AxiosError } from 'axios';
export declare const DEFAULT_ERROR_RESPONSE: {
    success: boolean;
    message: string;
    statusCode: number;
};
declare function handleApiError<Error>(error: AxiosError): Error;
export default handleApiError;
