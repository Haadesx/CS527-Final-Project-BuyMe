import { apiSlice } from './apiSlice';

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => ({
                url: '/api/notification',
            }),
            keepUnusedDataFor: 5,
        }),
        markRead: builder.mutation({
            query: (id) => ({
                url: `/api/notification/${id}/read`,
                method: 'PUT',
            }),
        }),
        notifyBid: builder.mutation({
            // No longer needed from frontend if backend handles it, but keeping as no-op or specific triggered alert
            // For now, let's keep it as no-op or remove usage from Header later. 
            // Actually, Header calls this. Let's make it a no-op or valid call if we want to force something.
            // But backend handles outbid now.
            queryFn: () => ({ data: {} }),
        }),
    }),
});

export const { useGetNotificationsQuery, useNotifyBidMutation, useMarkReadMutation } = notificationApiSlice;
