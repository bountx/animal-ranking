export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await Promise.resolve(params);

    return (
        <div lang={locale}>
            {children}
        </div>
    );
}

// Add metadata for better SEO
export async function generateMetadata(context: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(context.params);
    return {
        title: locale === 'en' ? 'Animal Rankings' : 'Ranking Zwierząt',
        description: locale === 'en'
            ? 'Rate and discover popular animals'
            : 'Oceniaj i odkrywaj popularne zwierzęta'
    };
}