import { apiSlice } from './apiSlice';

export const alertsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAlerts: builder.query({
            query: () => ({
                url: '/api/alert',
            }),
            keepUnusedDataFor: 5,
        }),
        createAlert: builder.mutation({
            query: (data) => ({
                url: '/api/alert',
                method: 'POST',
                body: data,
            }),
        }),
        deleteAlert: builder.mutation({
            query: (id) => ({
                url: `/api/alert/${id}`,
                method: 'DELETE',
            }),
        }),
        getMatchingAuctions: builder.query({
            query: () => ({
                url: '/api/alert/matches',
            }),
        }),
    }),
});

export const {
    useGetAlertsQuery,
    useCreateAlertMutation,
    useDeleteAlertMutation,
    useGetMatchingAuctionsQuery,
} = alertsApiSlice;
