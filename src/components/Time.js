import React from "react";
import TimeAgo from "timeago-react";
import * as timeago from "timeago.js";

const EN_US = ["second", "minute", "hour", "day", "week", "month", "year"];
const en = (diff, idx) => {
	if (idx === 0) return ["just now", "right now"];
	let unit = EN_US[Math.floor(idx / 2)];
	if (diff > 1) unit += "s";
	return [`${diff} ${unit}`, `in ${diff} ${unit}`];
};

timeago.register("en-US-mod", en);

const Time = ({ date }) => <TimeAgo datetime={date} locale={"en-US-mod"} live={true} />;

export default Time;
