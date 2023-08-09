//GPT-4:
//help me figure out the algorithm to convert an srt file which is this format:
// 482
// 00:20:30,480 --> 00:20:32,480
// Is that your key, the part of the key to success then it just,
// to this format:
// - {{renderer :media-timestamp, 1230}} Is that your key, the part of the key to success then it just,

export default function convertSrt(srtContent: string): string {
	const lines = srtContent.split("\n");
	const output: string[] = [];

	let i = 0;
	while (i < lines.length) {
		const line = lines[i].trim();

		// Check if the line matches the timestamp format
		if (line.includes("-->")) {
			// Extract start timestamp
			const startTime = line.split("-->")[0].trim();
			const [hh, mm, ss_mmm] = startTime.split(":");
			const [ss, mmm] = ss_mmm.split(",");

			// Convert timestamp to seconds
			const totalSeconds =
				parseInt(hh) * 3600 +
				parseInt(mm) * 60 +
				parseInt(ss) +
				parseInt(mmm) / 1000;

			// Format the output
			const subtitleText = lines[i + 1].trim();
			const formattedOutput = `- {{renderer :media-timestamp, ${totalSeconds}}} ${subtitleText}`;
			output.push(formattedOutput);

			i += 2;
		} else {
			i += 1;
		}
	}

	return output.join("\n");
}
