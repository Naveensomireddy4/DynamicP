// project.js — reads ?repo=name from URL and fetches repo details + README
(async function(){
  function q(name){
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }
  const repoName = q('repo');
  const detailEl = document.getElementById('project-detail');
  const titleEl = document.getElementById('proj-title');

  if(!repoName){
    detailEl.innerHTML = '<p>No repo specified. Use ?repo=REPO_NAME</p>';
    return;
  }

  titleEl.textContent = repoName;

  try{
    const username = 'Naveensomireddy4'; // your GitHub username
    const rRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
    if(!rRes.ok) throw new Error('Repo not found');
    const repo = await rRes.json();

    // fetch README (raw)
    const readRes = await fetch(`https://raw.githubusercontent.com/${username}/${repoName}/main/README.md`);
    let readme = '';
    if(readRes.ok) readme = await readRes.text();
    else {
      // try README.md at root with other branches or fallback to API
      const apiRead = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`);
      if(apiRead.ok){
        const j = await apiRead.json();
        readme = atob(j.content);
      }
    }

    // build detail HTML
    detailEl.innerHTML = `
      <h2>${repo.full_name}</h2>
      <p>${repo.description||''}</p>
      <p><strong>Language:</strong> ${repo.language||'—'} • <strong>Stars:</strong> ${repo.stargazers_count} • <strong>Forks:</strong> ${repo.forks_count}</p>
      <p><a href="${repo.html_url}" target="_blank">Open on GitHub</a> ${repo.homepage?` | <a href="${repo.homepage}" target="_blank">Live Demo</a>`:''}</p>
      <hr />
      <div id="readme-content">${readme?marked.parse(readme):'<em>No README.md found</em>'}</div>
    `;

  }catch(err){
    detailEl.innerHTML = '<p>Failed to load project details.</p>';
    console.error(err);
  }

  // theme toggle
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if(saved==='light') document.body.classList.add('light');
  btn.addEventListener('click',()=>{
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light')?'light':'dark');
  });

})();