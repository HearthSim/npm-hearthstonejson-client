import HearthstoneJSON from "./HearthstoneJSON";

const WISP = {
	"artist": "Malcolm Davis",
	"attack": 1,
	"cardClass": "NEUTRAL",
	"collectible": true,
	"cost": 0,
	"dbfId": 179,
	"flavor": "If you hit an Eredar Lord with enough Wisps, it will explode.   But why?",
	"health": 1,
	"id": "CS2_231",
	"name": "Wisp",
	"rarity": "COMMON",
	"set": "EXPERT1",
	"type": "MINION"
};

describe("HearthstoneJSON", function() {
	describe("fetch", () => {
		it("fetches", async () => {
			fetchMock.mockResponse(JSON.stringify([WISP]), {
				headers: {
					"content-type": "application/json",
				},
				url: "https://api.hearthstonejson.com/v1/39954/enUS/cards.json"
			});
			const hsjson = await HearthstoneJSON.fetch();
			expect(hsjson.build).toEqual(39954);
			expect(hsjson.locale).toEqual("enUS");
			expect(hsjson.cards).toHaveLength(1);
			expect(hsjson.cards[0]).toEqual(WISP);
		});
	});

	describe("extractBuild", () => {

	});

	describe("getUrl", () => {
		test.each([
			[
				39954,
				"enUS",
				undefined,
				"https://api.hearthstonejson.com/v1/39954/enUS/cards.json",
			],
			[
				"latest",
				"deDE",
				undefined,
				"https://api.hearthstonejson.com/v1/latest/deDE/cards.json",
			],
			[
				39954,
				"deDE",
				undefined,
				"https://api.hearthstonejson.com/v1/39954/deDE/cards.json",
			],
			[
				39954,
				"enUS",
				"cards.json",
				"https://api.hearthstonejson.com/v1/39954/enUS/cards.json",
			],
			[
				39954,
				"enUS",
				"cards.collectible.json",
				"https://api.hearthstonejson.com/v1/39954/enUS/cards.collectible.json",
			],
		])(
			"getUrl(%p, %p, %p) => %p",
			(build: any, locale: any, resource: any, expected: string) => {
				expect(
					(HearthstoneJSON as any).getUrl(build, locale, resource)
				).toEqual(expected);
			}
		);
	});
});
