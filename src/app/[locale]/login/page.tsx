import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(searchParams: SearchParams) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (typeof value === 'string') {
            params.set(key, value);
            continue;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                params.append(key, item);
            }
        }
    }

    return params.toString();
}

export default async function LocalizedLoginRedirect({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const queryString = toQueryString(await searchParams);
    redirect(queryString ? `/login?${queryString}` : '/login');
}
