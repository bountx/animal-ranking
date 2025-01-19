'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function TestPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const testContent = `First article content here.

## Physical Characteristics

* Can jump up to 20 feet high
* Weighs between 100-150 kg
* Has distinctive markings

## Behavior Patterns

* Hunts primarily at night
* Lives in social groups
* Shows complex problem-solving abilities

Further observations have shown interesting patterns.

---

Second article starts here.

## Additional Insights

* Point one about adaptation
* Point two about habitat
* Point three about diet

Final paragraph here.`;

    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Changed to use our new markdown class */}
            <ReactMarkdown
                className="markdown"
            >
                {testContent}
            </ReactMarkdown>
        </div>
    );
}