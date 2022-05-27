interface Env {
	WALSHYFAILS: KVNamespace;
}
const streamDeckURL = 'https://streamdeck.dev/d81c2c1632eb3f1e164a35956af2852324e14e048f657a2f341e9e237d3167bf';
const steamDeckFetchOptions = (count: number): object => {
	return {
		method: "PATCH",
		body: JSON.stringify({
			title: `\n\nFails\n${count}`,
			coordinates: {
				row: 0,
				column: 1,
			},
		}),
	};
};
const indexHtml = (count: number): string => `<html>
	<head>
		<title>Walshy Fail Counter</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="Walshy fails a lot, and causes a lot of failures. Every hit will increase the fail counter.">
		<style>:root {color-scheme: dark light}</style>
	</head>
	<body>
		<div style="text-align: center">
			<img height="128" width="128" src="https://r2-sharex.jross.me/file/2022/04/da847915-3865-40f3-affc-c0d113cab7c8.png">
			<h1>Walshy Fails!</h1>
			<h2>Fail Counter: ${count}</h2>
		</div>
	</body>
</html>`.trim();

const getFailCount = async (env: Env): Promise<number> => {
	const getFailCount = await env.WALSHYFAILS.get('count');
	let failCount: number = null;
	if(getFailCount !== null){
		failCount = Number(getFailCount);
	}else{
		failCount = 0;
	}
	return failCount;
};

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>{
	const url = new URL(request.url);
	// TODO: move to router
	// TODO: maybe move to DO?
	if(url.pathname === '/favicon.ico'){
		return fetch('https://r2-sharex.jross.me/file/2022/04/b7f60be5-ec7b-49bf-93af-bf5efa98944b.ico');
	}else if(url.pathname === '/count'){
		let failCount = await getFailCount(env);
		if(url.searchParams.has('increment')){
			failCount++;
			ctx.waitUntil(env.WALSHYFAILS.put('count', String(failCount)));
		}
		ctx.waitUntil(fetch(streamDeckURL, steamDeckFetchOptions(failCount)));
		return new Response(JSON.stringify({
			count: failCount,
			incremented: url.searchParams.has('increment'),
		}), {
			headers: {
				'content-type': 'application/json',
			},
		});
	}else if(url.pathname !== '/'){
		return new Response('wat');
	}
	let failCount = await getFailCount(env);
	failCount++;
	ctx.waitUntil(env.WALSHYFAILS.put('count', String(failCount)));
	ctx.waitUntil(fetch(streamDeckURL, steamDeckFetchOptions(failCount)));
	return new Response(indexHtml(failCount), {
		headers: {
			'content-type': 'text/html',
		},
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>{
		return handleRequest(request, env, ctx);
	},
};