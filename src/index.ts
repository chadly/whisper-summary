import "dotenv/config";

import path from "path";
import fs from "fs";

import { z } from "zod";

import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import {
	StructuredOutputParser,
	OutputFixingParser,
} from "langchain/output_parsers";

import convertSrt from "./srt-to-logseq";

const PATH =
	"/mnt/c/Users/Chad Lee/Documents/logseq/assets/GMT20230731-140118_Recording_1690832979802_0.srt";

const OUTPUT_PATH = path.join(__dirname, "..", "output");

async function convertSrtFile() {
	const content = await fs.promises.readFile(PATH, "utf8");
	return convertSrt(content);
}

const prompt = new PromptTemplate({
	inputVariables: ["fileContents"],
	template: `
I would like you to take this transcript of a conversation and break it up into logical sections
with headings and a short description summarizing each section.

For example, this content:

- {{renderer :media-timestamp, 0}} Hello.
- {{renderer :media-timestamp, 25.48}} Good morning.
- {{renderer :media-timestamp, 27.48}} How are you?
- {{renderer :media-timestamp, 28.48}} Good.
- {{renderer :media-timestamp, 30.48}} Caffeinated.
- {{renderer :media-timestamp, 31.48}} Feeling good.
- {{renderer :media-timestamp, 32.48}} Yeah.
- {{renderer :media-timestamp, 33.48}} Nice.
- {{renderer :media-timestamp, 34.48}} Me too.
- {{renderer :media-timestamp, 35.48}} I just had an energy drink.
- {{renderer :media-timestamp, 37.48}} Oh, nice.
- {{renderer :media-timestamp, 38.48}} Good.
- {{renderer :media-timestamp, 39.48}} We're both bouncing off the walls on this very last day of July.
- {{renderer :media-timestamp, 43.48}} Oh, is that what it is?
- {{renderer :media-timestamp, 45.48}} Yeah, it is.
- {{renderer :media-timestamp, 46.48}} Oh, shit.
- {{renderer :media-timestamp, 47.48}} Rent's due.
- {{renderer :media-timestamp, 48.48}} Boy, that's not a problem.
- {{renderer :media-timestamp, 49.48}} It's fine.
- {{renderer :media-timestamp, 50.48}} Everything's fine.
- {{renderer :media-timestamp, 51.48}} Yes.
- {{renderer :media-timestamp, 52.48}} Yes.
- {{renderer :media-timestamp, 53.48}} And school starts.
- {{renderer :media-timestamp, 55.48}} Oh, that's a good thing.
- {{renderer :media-timestamp, 57.48}} Two weeks.
- {{renderer :media-timestamp, 58.48}} I don't know when this, when this.
- {{renderer :media-timestamp, 60.48}} Your kids start.
- {{renderer :media-timestamp, 62.48}} Yeah, I think it's happening.
- {{renderer :media-timestamp, 63.48}} I just have a vague sense that it's coming.
- {{renderer :media-timestamp, 66.48}} I think very soon.
- {{renderer :media-timestamp, 68.48}} Right.
- {{renderer :media-timestamp, 69.48}} It's like, oh, beginning August.
- {{renderer :media-timestamp, 70.48}} And it's like, oh, crap.
- {{renderer :media-timestamp, 71.48}} Tomorrow's August.
- {{renderer :media-timestamp, 72.48}} Shit.
- {{renderer :media-timestamp, 74.48}} Time keeps moving.
- {{renderer :media-timestamp, 76.48}} Yeah.
- {{renderer :media-timestamp, 77.48}} Yeah.
- {{renderer :media-timestamp, 78.48}} All right.

should be converted to something like this:

## Small Talk
	- {{renderer :media-timestamp, 0}} Pleasantries and discussion of the start of the school year.
		- {{renderer :media-timestamp, 0}} Hello.
		- {{renderer :media-timestamp, 25.48}} Good morning.
		- {{renderer :media-timestamp, 27.48}} How are you?
		- {{renderer :media-timestamp, 28.48}} Good.
		- {{renderer :media-timestamp, 30.48}} Caffeinated.
		- {{renderer :media-timestamp, 31.48}} Feeling good.
		- {{renderer :media-timestamp, 32.48}} Yeah.
		- {{renderer :media-timestamp, 33.48}} Nice.
		- {{renderer :media-timestamp, 34.48}} Me too.
		- {{renderer :media-timestamp, 35.48}} I just had an energy drink.
		- {{renderer :media-timestamp, 37.48}} Oh, nice.
		- {{renderer :media-timestamp, 38.48}} Good.
		- {{renderer :media-timestamp, 39.48}} We're both bouncing off the walls on this very last day of July.
		- {{renderer :media-timestamp, 43.48}} Oh, is that what it is?
		- {{renderer :media-timestamp, 45.48}} Yeah, it is.
		- {{renderer :media-timestamp, 46.48}} Oh, shit.
		- {{renderer :media-timestamp, 47.48}} Rent's due.
		- {{renderer :media-timestamp, 48.48}} Boy, that's not a problem.
		- {{renderer :media-timestamp, 49.48}} It's fine.
		- {{renderer :media-timestamp, 50.48}} Everything's fine.
		- {{renderer :media-timestamp, 51.48}} Yes.
		- {{renderer :media-timestamp, 52.48}} Yes.
		- {{renderer :media-timestamp, 53.48}} And school starts.
		- {{renderer :media-timestamp, 55.48}} Oh, that's a good thing.
		- {{renderer :media-timestamp, 57.48}} Two weeks.
		- {{renderer :media-timestamp, 58.48}} I don't know when this, when this.
		- {{renderer :media-timestamp, 60.48}} Your kids start.
		- {{renderer :media-timestamp, 62.48}} Yeah, I think it's happening.
		- {{renderer :media-timestamp, 63.48}} I just have a vague sense that it's coming.
		- {{renderer :media-timestamp, 66.48}} I think very soon.
		- {{renderer :media-timestamp, 68.48}} Right.
		- {{renderer :media-timestamp, 69.48}} It's like, oh, beginning August.
		- {{renderer :media-timestamp, 70.48}} And it's like, oh, crap.
		- {{renderer :media-timestamp, 71.48}} Tomorrow's August.
		- {{renderer :media-timestamp, 72.48}} Shit.
		- {{renderer :media-timestamp, 74.48}} Time keeps moving.
		- {{renderer :media-timestamp, 76.48}} Yeah.
		- {{renderer :media-timestamp, 77.48}} Yeah.
		- {{renderer :media-timestamp, 78.48}} All right.

Notice that the original transcript contents are not lost - just indented underneath the summary.

Here is the file I'd like you to convert:

{fileContents}
	`,
});

const llm = new OpenAI({
	modelName: "gpt-4-32k",
	temperature: 0.5,
});

const chain = new LLMChain({
	llm,
	prompt,
});

const run = async () => {
	const content = await convertSrtFile();

	const { text: result } = await chain.call({ fileContents: content });

	const outputFile = path.join(OUTPUT_PATH, "mind-coach_2023-07-31.md");

	console.log(`Saving to ${outputFile}`);
	await fs.promises.writeFile(outputFile, result, "utf8");
	console.log("Done!");
};

run();
