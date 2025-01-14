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
