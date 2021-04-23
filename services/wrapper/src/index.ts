import axios from "axios";

const REPO_URL = "https://repo.sourcify.dev/contracts/";

export type FetchOptions = {
    allowPartial?: boolean,
};

export type Metadata = {
    compiler: {
        version: string,
    },
    language: string,
    output: {
        abi: any[],
        userdoc: any,
        devdoc: any,
    },
    settings: any,
    sources: any,
    version: number,
};

export type Natspec = {
    userdoc: any,
    devdoc: any,
};

function getMetadataUrl(chain: number, address: string, matchLevel: "full" | "partial"): string {
    return `${REPO_URL}/${matchLevel}_match/${chain}/${address}/metadata.json`;
}

/**
 * Performs a GET request on the specified URL.
 * Returns the body if status is `200`, otherwise `null`
 * @param url the URL on which GET is performed
 */
async function customFetch(url: string) {
    try {
        const res = await axios.get(url);
        if (res.status === 200) {
            return res.data;
        }
    } catch (err) { undefined }

    return null;
}

export async function getMetadata(chain: number, address: string, options: FetchOptions = {}): Promise<Metadata> {
    const fullMatchMetadataUrl = getMetadataUrl(chain, address, "full");

    const metadata = await customFetch(fullMatchMetadataUrl);
    if (metadata) {
        return metadata;
    }

    if (options.allowPartial) {
        const partialMatchMetadataUrl = getMetadataUrl(chain, address, "partial");
        const metadata = await customFetch(partialMatchMetadataUrl);
        if (metadata) {
            return metadata;
        }
    }

    throw new Error(`Could not get metadata from chain ${chain} and address ${address}. Try modifying the options.`);
}

export async function getNatspec(chain: number, address: string, options: FetchOptions = {}): Promise<Natspec> {
    const metadata = await getMetadata(chain, address, options);
    return {
        userdoc: metadata.output.userdoc,
        devdoc: metadata.output.devdoc,
    };
}
