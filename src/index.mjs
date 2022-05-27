const steamDeckFetchOptions = (count) => {
	return {
		method: "PATCH",
		body: JSON.stringify({
			title: `\n\nAwesome count:\n${count}`,
			coordinates: {
				row: 0,
				column: 1,
			},
		}),
	};
};
const indexHtml = count => `<html>
	<head>
		<title>Walshy Awesome Counter</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="Walshy fails a lot, and causes a lot of failures. Every hit will increase the fail counter.">
		<style>:root {color-scheme: dark light}</style>
	</head>
	<body>
		<div style="text-align: center">
			<img height="128" width="128" src="https://files.jross.me/2022/04/da847915-3865-40f3-affc-c0d113cab7c8.png">
			<h1>Walshy is awesome!</h1>
			<h2>Awesome Counter: ${count}</h2>
		</div>
	</body>
</html>`.trim();

async function handleRequest(request, env, ctx){
	const url = new URL(request.url);
	// TODO: cleanup logic here to make it more readable
	// TODO: move to router
	// TODO: maybe move to DO?
	if(url.pathname === '/count'){
		let awesomeCount = await env.WALSHYFAILS.get('count');
		if(awesomeCount !== null){
			awesomeCount = Number(awesomeCount);
		}else{
			failCount = 0;
		}
		if(url.searchParams.has('increment')){
			awesomeCount++;
			ctx.waitUntil(env.WALSHYFAILS.put('count', awesomeCount));
		}
		ctx.waitUntil(fetch("https://streamdeck.dev/d81c2c1632eb3f1e164a35956af2852324e14e048f657a2f341e9e237d3167bf", steamDeckFetchOptions(awesomeCount)));
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
	let awesomeCount = await env.WALSHYFAILS.get('count');
	if(awesomeCount !== null){
		awesomeCount = Number(awesomeCount);
	}else{
		failCount = 0;
	}
	failCount++;
	ctx.waitUntil(env.WALSHYFAILS.put('count', awesomeCount));
	ctx.waitUntil(fetch("https://streamdeck.dev/d81c2c1632eb3f1e164a35956af2852324e14e048f657a2f341e9e237d3167bf", steamDeckFetchOptions(awesomeCount)));
	return new Response(indexHtml(awesomeCount), {
		headers: {
			'content-type': 'text/html',
		},
	});
}

export default {
	async fetch(request, env, ctx){
		return handleRequest(request, env, ctx);
	},
};
