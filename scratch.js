

async function go() {
  const res = await fetch("https://api.quran.com/api/v4/search?q=ramadan&size=1&page=1&language=en");
  const data = await res.json();
  console.log(JSON.stringify(data.search.results[0], null, 2));
}

go();
