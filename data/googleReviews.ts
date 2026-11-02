export type GoogleReview = {
    author: string;
    rating: number;
    excerpt: string;
    url: string;
};

// Curated excerpts must retain the reviewer's wording and the original review's
// Google share URL. Add only reviews verified against the TRAVIS listing.
// These reviews and their five-star ratings were verified on 2026-11-02.
// This is a curated selection, not an automatically synchronized review feed.
export const googleReviews: { url: string; reviews: GoogleReview[] } = {
    url: 'https://www.google.com/maps/place/TRAVIS+Engineering+Inc./data=!4m2!3m1!1s0x89d4cb468b225107:0x83a954d94d331e09',
    reviews: [
        {
            author: 'Mark Dawson',
            rating: 5,
            excerpt: 'Did a great job assessing a commercial flat roof and helped solve a problem we’ve been having for years.',
            url: 'https://share.google/icZ2AjBODqduwamK1',
        },
        {
            author: 'Nix Capital',
            rating: 5,
            excerpt: 'The team at Travis Engineering is not only highly skilled but also incredibly responsive.',
            url: 'https://share.google/myT62AmW0rZSegmdf',
        },
        {
            author: 'DEEPALI DAVID',
            rating: 5,
            excerpt: 'I highly recommend the two day Travis Engineering certification program. Great content with links and physical and digital badge at the end.',
            url: 'https://share.google/O6Uq3dQAVCu8htDsY',
        },
        {
            author: 'elijah 1456',
            rating: 5,
            excerpt: 'First time participating in this course, would definitely recommend for someone looking for more information regarding home inspections…',
            url: 'https://share.google/OoGVIckhlr9G27yWz',
        },
        {
            author: 'Chris Claughton',
            rating: 5,
            excerpt: 'I just finished my second course and absolutely love the content.',
            url: 'https://share.google/lLMzDg7UmJwFivx0Z',
        },
        {
            author: 'Franco Sirianni',
            rating: 5,
            excerpt: 'Great course, lots of valid information pertaining to roof inspections. I like that they provide technical material (weather mapping, drones etc). Highly recommended',
            url: 'https://share.google/GpZS7xzJJKSbau7Wn',
        },
    ],
};
