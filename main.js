// main.js — loads data.json, initializes Typed.js, AOS, fetches GitHub repos and renders homepage
(async function(){
  const data = await (await fetch('data.json')).json();

  // basic meta
  document.getElementById('name').textContent = data.meta.name;
  document.getElementById('email-link').href = 'mailto:'+data.meta.email;
  document.getElementById('linkedin-link').href = data.meta.linkedin;
  document.getElementById('github-link').href = data.meta.github;
  document.getElementById('year').textContent = new Date().getFullYear();

  // typed
  const typedEl = document.getElementById('typed');
  if(window.Typed){
    new Typed(typedEl, { strings: data.meta.typing, typeSpeed:60, backSpeed:30, backDelay:1500, loop:true });
  } else {
    typedEl.textContent = data.meta.typing.join(' | ');
  }

  // about
  document.getElementById('about-content').innerHTML = `<p>${data.about}</p>`;

  // skills
  const skills = data.skills;
  const skillsHtml = [`<p><strong>Programming:</strong> ${skills.programming}</p>`,
    `<p><strong>ML/AI:</strong> ${skills.ml}</p>`,
    `<p><strong>Specializations:</strong> ${skills.specializations}</p>`,
    `<p><strong>Web:</strong> ${skills.web}</p>`,
    `<p><strong>DevOps:</strong> ${skills.devops}</p>`].join('\n');
  document.getElementById('skills-content').innerHTML = skillsHtml;

  // experience
  const expHtml = data.experience.map(e=>`<div class="card"><h3>${e.role}</h3><p><em>${e.org} • ${e.period}</em></p><ul>${e.bullets.map(b=>`<li>${b}</li>`).join('')}</ul></div>`).join('');
  document.getElementById('experience-content').innerHTML = expHtml;

  // education
  document.getElementById('education-content').innerHTML = data.education.map(ed=>`<div class="card"><h3>${ed.degree}</h3><p><em>${ed.inst} • ${ed.period}</em></p><p>${ed.note || ''}</p></div>`).join('');

  // extras
  document.getElementById('extras-content').innerHTML = `<ul>${data.extras.map(x=>`<li>${x}</li>`).join('')}</ul>`;

  // load projects from GitHub
  const repoHolder = document.getElementById('projects-grid');
  repoHolder.innerHTML = '';

  try{
    // fetch public repos from your username
    const username = data.meta.github.split('/').pop();
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const repos = await res.json();

    // optional: filter forks
    const filtered = repos.filter(r=>!r.fork);

    // merge featured from data.projects (if any)
    const pinned = data.projects.filter(p=>p.featured).map(p=>p.repo);

    // bring pinned to top
    filtered.sort((a,b)=> (pinned.includes(b.name)?1:0) - (pinned.includes(a.name)?1:0));

    // render
    filtered.forEach(repo=>{
      const card = document.createElement('div');
      card.className = 'project-card card';
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description||''}</p>
        <div class="badges">
          <span class="badge">${repo.language||'—'}</span>
          <span class="badge">★ ${repo.stargazers_count}</span>
        </div>
        <div style="margin-top:10px" class="project-buttons">
          <a href="${repo.html_url}" target="_blank">View on GitHub</a>
          <a href="project.html?repo=${encodeURIComponent(repo.name)}">View Details</a>
        </div>
      `;
      repoHolder.appendChild(card);
    });

  }catch(err){
    repoHolder.innerHTML = '<div class="card">Failed to load projects from GitHub.</div>';
    console.error(err);
  }

  // AOS init
  if(window.AOS) AOS.init({duration:700, once:true});

  // theme toggle & remember
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if(saved==='light') document.body.classList.add('light');
  btn.addEventListener('click',()=>{
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light')?'light':'dark');
  });

})();