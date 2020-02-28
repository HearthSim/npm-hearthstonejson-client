import fetch from "isomorphic-unfetch";
import {
	CardData,
	HearthstoneBuild,
	HearthstoneLocale,
} from "hearthstonejson-client";

const ENDPOINT_RE = /^https:\/\/api.hearthstonejson.com\/v(\d+)\/(\d+)\/([A-z]+)\/cards\.json/;

export default class HearthstoneJSON {
	public readonly build: HearthstoneBuild;
	public readonly locale: HearthstoneLocale;
	public readonly cards: CardData[];

	constructor(
		build: HearthstoneBuild,
		locale: HearthstoneLocale,
		cards: CardData[]
	) {
		this.build = build;
		this.locale = locale;
		this.cards = cards;
	}

	public static async fetch(
		build?: HearthstoneBuild,
		locale?: HearthstoneLocale
	): Promise<HearthstoneJSON> {
		const {
			build: finalBuild,
			locale: finalLocale,
			cards,
		} = await this.doFetch(build || "latest", locale || "enUS");
		return new HearthstoneJSON(finalBuild, finalLocale, cards);
	}

	private static async doFetch(
		build: HearthstoneBuild | "latest",
		locale: HearthstoneLocale
	): Promise<{
		build: HearthstoneBuild;
		locale: HearthstoneLocale;
		cards: CardData[];
	}> {
		const headers = new Headers();
		headers.set("accept", "application/json; charset=utf-8");
		const response = await fetch(this.getUrl(build, locale), {
			method: "GET",
			headers,
			mode: "cors",
			// "no-cache" will make a conditional requestta
			cache: "no-cache",
			redirect: "follow",
		});
		if (!response.ok) {
			throw new Error(`Got bad status code ${response.status}`);
		}
		const contentType = response.headers.get("content-type");
		if (contentType !== "application/json") {
			throw new Error(`Got unknown content type ${contentType}`);
		}
		const data = await response.json();
		if (!Array.isArray(data)) {
			throw new Error("Got invalid data: Not an array");
		}
		return {
			build: this.extractBuild(response),
			locale,
			cards: data as CardData[],
		};
	}

	private static getUrl(
		build: HearthstoneBuild | "latest",
		locale: HearthstoneLocale,
		resource: string = "cards.json"
	): string {
		return `https://api.hearthstonejson.com/v1/${build}/${locale}/${resource}`;
	}

	private static extractBuild(response: Response): HearthstoneBuild {
		// Method 1: If the response contains an explicit header, return that
		if (response.headers.has("x-hearthstonejson-build")) {
			return +(response.headers.get("x-hearthstonejson-build") as string);
		}

		// Method 2: If it's a well-known URL, extract it
		if (response.url && ENDPOINT_RE.test(response.url)) {
			const matches = ENDPOINT_RE.exec(response.url);
			if (matches) {
				return +matches[2] as HearthstoneBuild;
			}
		}

		// Give up
		throw new Error("Unable to determine build");
	}
}
