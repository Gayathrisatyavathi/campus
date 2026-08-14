const state = { user: null, profile: null, dashboard: null };
const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const sidebar =
    document.querySelector(".dashboard-sidebar");


if (mobileMenuBtn && sidebar)
{
    mobileMenuBtn.addEventListener("click", () =>
    {
        sidebar.classList.toggle("active");
    });
}
/* =========================================================
   MOBILE SIDEBAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function ()
    {
        const sidebar =
            document.getElementById("sidebar");

        const sidebarToggle =
            document.getElementById(
                "sidebarToggle"
            );

        const sidebarOverlay =
            document.getElementById(
                "sidebarOverlay"
            );


        if (!sidebar)
        {
            return;
        }


        function openSidebar()
        {
            sidebar.classList.add("open");

            if (sidebarOverlay)
            {
                sidebarOverlay.classList.add(
                    "active"
                );
            }

            document.body.style.overflow =
                "hidden";
        }


        function closeSidebar()
        {
            sidebar.classList.remove("open");

            if (sidebarOverlay)
            {
                sidebarOverlay.classList.remove(
                    "active"
                );
            }

            document.body.style.overflow =
                "";
        }


        if (sidebarToggle)
        {
            sidebarToggle.addEventListener(
                "click",
                function ()
                {
                    if (
                        sidebar.classList.contains(
                            "open"
                        )
                    )
                    {
                        closeSidebar();
                    }
                    else
                    {
                        openSidebar();
                    }
                }
            );
        }


        if (sidebarOverlay)
        {
            sidebarOverlay.addEventListener(
                "click",
                closeSidebar
            );
        }


        /* Close menu after clicking a page */

        sidebar
            .querySelectorAll(
                ".side-link"
            )
            .forEach(
                function (link)
                {
                    link.addEventListener(
                        "click",
                        function ()
                        {
                            if (
                                window.innerWidth <=
                                760
                            )
                            {
                                closeSidebar();
                            }
                        }
                    );
                }
            );


        /* Close when resizing back to desktop */

        window.addEventListener(
            "resize",
            function ()
            {
                if (
                    window.innerWidth > 760
                )
                {
                    closeSidebar();
                }
            }
        );
    }
);
document.addEventListener(
    "DOMContentLoaded",
    function ()
    {
        const menuToggle =
            document.getElementById(
                "menuToggle"
            );

        const nav =
            document.querySelector(
                ".landing-nav nav"
            );


        if (!menuToggle || !nav)
        {
            return;
        }


        menuToggle.addEventListener(
            "click",
            function ()
            {
                const isOpen =
                    nav.classList.toggle(
                        "open"
                    );

                menuToggle.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );
            }
        );


        nav.querySelectorAll("a").forEach(
            function (link)
            {
                link.addEventListener(
                    "click",
                    function ()
                    {
                        nav.classList.remove(
                            "open"
                        );

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                );
            }
        );
    }
);
const content = document.getElementById("dashboard-content");
const title = document.getElementById("page-title");
async function api(url, options = {}) { const response = await fetch(url, { credentials:"include", ...options }); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.message||"Request failed."); return data; }
function toast(message,type="success"){const root=document.getElementById("toast-root");const item=document.createElement("div");item.className=`toast ${type}`;item.textContent=message;root.appendChild(item);setTimeout(()=>item.remove(),3200)}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function date(value){return value?new Date(value).toLocaleDateString():"—"}
function list(items,renderer){return items?.length?`<div class="item-list">${items.map(renderer).join("")}</div>`:'<div class="empty">No records available yet.</div>'}
function dashboardView(){const p=state.profile||{},d=state.dashboard||{};title.textContent="Dashboard";content.innerHTML=`<div class="dash-hero"><div><div class="eyebrow">WELCOME BACK</div><h2>Welcome, ${esc(p.fullName||state.user?.name||"Student")} 👋</h2><div class="muted">Your campus career command center is ready.</div></div><a class="btn primary" href="#" onclick="showSection('profile');return false">Complete Profile →</a></div><div class="dashboard-grid"><div class="dashboard-card"><h3>Profile Completion</h3><div class="big">${p.profileCompletion||0}%</div><div class="progress"><i style="width:${p.profileCompletion||0}%"></i></div><small class="muted">${esc(p.profileCompletion<100?"Add projects, skills and resume to improve.":"Profile complete!")}</small></div><div class="dashboard-card"><h3>Upcoming Interviews</h3><div class="big">${d.interviews?.length||0}</div><small class="muted">Scheduled in your account</small></div><div class="dashboard-card"><h3>New Jobs</h3><div class="big">${d.jobs?.length||0}</div><small class="muted">Latest opportunities</small></div><div class="dashboard-card"><h3>Training</h3><div class="big">${d.training?.length||0}</div><small class="muted">Programs to explore</small></div><div class="dashboard-card wide-card"><h3>Placement Opportunities</h3>${list(d.placements,x=>`<div class="list-item"><b>${esc(x.companyName)} — ${esc(x.jobRole)}</b><small>${esc(x.location)} • ${esc(x.package)} • Deadline ${date(x.applicationDeadline)}</small></div>`)}</div><div class="dashboard-card wide-card"><h3>Company Calls</h3>${list(d.calls,x=>`<div class="list-item"><b>${esc(x.companyName)} — ${esc(x.role)}</b><small>${date(x.date)} • ${esc(x.venue)}</small></div>`)}</div><div class="dashboard-card"><h3>AI Skills</h3><div class="panel-chips"><span>GenAI</span><span>ML</span><span>Cloud</span><span>Cybersecurity</span></div><a class="btn ghost" style="margin-top:14px" href="#" onclick="showSection('aiSkills');return false">View Roadmap</a></div><div class="dashboard-card"><h3>Achievements</h3><div class="big">${d.achievements?.length||0}</div><small class="muted">Career highlights</small></div></div>`}
async function resourceView(resource,heading){title.textContent=heading;content.innerHTML='<div class="loader"></div>';const {data}=await api(`/api/${resource}`);renderResource(resource,heading,data,"")}
function renderResource(resource,heading,data,search=""){let html="";if(resource==="placements")html=list(data,x=>`<div class="list-item"><b>${esc(x.companyName)} — ${esc(x.jobRole)}</b><small>${esc(x.location)} • ${esc(x.package)} • ${esc(x.eligibility)}</small><small>${esc((x.requiredSkills||[]).join(", "))} • Deadline ${date(x.applicationDeadline)}</small><button class="btn primary" style="margin-top:10px" onclick="applyPlacement('${x._id}')">Apply</button></div>`);else if(resource==="companyCalls")html=list(data,x=>`<div class="list-item"><b>${esc(x.logo||"🏢")} ${esc(x.companyName)} — ${esc(x.role)}</b><small>${date(x.date)} • ${esc(x.venue)} • ${esc(x.eligibility)}</small><small>${esc((x.requiredSkills||[]).join(", "))}</small><a class="btn ghost" style="margin-top:10px" target="_blank" rel="noopener" href="${esc(x.registrationLink||"#")}">Register</a></div>`);else if(resource==="jobs")html=list(data,x=>`<div class="list-item"><b>${esc(x.title)} — ${esc(x.company)} ${x.newNotification?'<span class="pill">NEW</span>':''}</b><small>${esc(x.location)} • ${esc(x.salary)} • Deadline ${date(x.deadline)}</small><a class="btn primary" style="margin-top:10px" target="_blank" rel="noopener" href="${esc(x.link||"#")}">Apply</a></div>`);else if(resource==="training")html=list(data,x=>`<div class="list-item"><b>${esc(x.title)}</b><small>${esc(x.provider)} • ${esc(x.duration)} • Starts ${date(x.startDate)}</small><small>${esc((x.skills||[]).join(", "))}</small><button class="btn ghost" style="margin-top:10px" onclick="toast('Registration request recorded for ${esc(x.title)}')">Register</button></div>`);else if(resource==="courses")html=list(data,x=>`<div class="list-item"><b>${esc(x.title)}</b><small>${esc(x.provider)} • ${esc(x.level)} • ${esc(x.duration)}</small><small>${esc((x.skills||[]).join(", "))}</small><a class="btn ghost" style="margin-top:10px" target="_blank" rel="noopener" href="${esc(x.link||"#")}">Open Course</a></div>`);else if(resource==="interviews")html=list(data,x=>`<div class="list-item"><b>${esc(x.company)} — ${esc(x.role)}</b><small>${date(x.interviewDate)} • ${esc(x.interviewType)} • <span class="pill">${esc(x.status)}</span></small><small>${esc((x.preparation||[]).join(" • "))}</small></div>`);else if(resource==="hiring")html=list(data,x=>`<div class="list-item"><b>${esc(x.company)} — ${esc(x.role)}</b><small>Application: <span class="pill">${esc(x.applicationStatus)}</span> • Interview: ${esc(x.interviewStatus||"—")} • Offer: ${esc(x.offerStatus||"—")}</small><small>${esc(x.notes||"")}</small></div>`);else if(resource==="tests")html=list(data,x=>`<div class="list-item"><b>${esc(x.title)}</b><small>${esc(x.category)} • ${esc(x.difficulty)} • ${esc(x.duration)} minutes • ${x.questions?.length||0} questions</small><button class="btn primary" style="margin-top:10px" onclick="startTest('${x._id}')">Start Test</button></div>`);else if(resource==="achievements")html=list(data,x=>`<div class="list-item"><b>${esc(x.title)}</b><small>${date(x.date)} • ${esc(x.category)}</small><small>${esc(x.description)}</small></div>`);content.innerHTML=`<div class="page-toolbar"><input id="resource-search" value="${esc(search)}" placeholder="Search ${heading.toLowerCase()}..."><button class="btn ghost" id="search-btn">Search</button></div><div class="dashboard-card full-card">${html}</div>`;document.getElementById("search-btn").onclick=()=>loadResource(resource,heading)}
async function loadResource(resource,heading){const search=document.getElementById("resource-search")?.value||"";const {data}=await api(`/api/${resource}?search=${encodeURIComponent(search)}`);renderResource(resource,heading,data,search)}
function field(label,name,value,type="text",placeholder=""){return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`}
function profileView(){const p=state.profile||{};const arr=k=>Array.isArray(p[k])?p[k].join(", "):(p[k]||"");title.textContent="My Profile";content.innerHTML=`<div class="dashboard-card full-card"><div class="dash-hero"><div><h2 class="section-title">Complete Your Student Profile</h2><div class="muted">Profile completion: ${p.profileCompletion||0}%</div><small class="muted">${esc(p.profileCompletion<100?"Add projects, certifications and resume to increase completion.":"Your profile is complete.")}</small></div><div style="min-width:220px"><div class="progress"><i style="width:${p.profileCompletion||0}%"></i></div></div></div><form id="profile-form" class="profile-form">${field("Full Name","fullName",p.fullName)}<label>Email<input name="email" type="email" value="${esc(p.email)}" readonly></label>${field("Phone","phone",p.phone)}${field("Date of Birth","dateOfBirth",p.dateOfBirth?.slice?.(0,10),"date")}${field("Gender","gender",p.gender)}${field("Address","address",p.address)}${field("College","college",p.college)}${field("Department","department",p.department)}${field("Course","course",p.course)}${field("Year","year",p.year)}${field("Roll Number","rollNumber",p.rollNumber)}${field("10th Percentage","percentage10",p.percentage10,"number")}${field("12th Percentage","percentage12",p.percentage12,"number")}${field("Diploma","diploma",p.diploma)}${field("Degree","degree",p.degree)}${field("CGPA","cgpa",p.cgpa,"number")}${field("Programming Languages","programmingLanguages",arr("programmingLanguages"),"text","Comma separated")}${field("Technical Skills","technicalSkills",arr("technicalSkills"),"text","Comma separated")}${field("Soft Skills","softSkills",arr("softSkills"),"text","Comma separated")}${field("AI Skills","aiSkills",arr("aiSkills"),"text","Comma separated")}${field("Tools & Technologies","tools",arr("tools"),"text","Comma separated")}${field("Preferred Job Role","preferredJobRole",p.preferredJobRole)}${field("Preferred Location","preferredLocation",p.preferredLocation)}${field("Expected Salary","expectedSalary",p.expectedSalary,"number")}${field("Interested Industries","interestedIndustries",arr("interestedIndustries"),"text","Comma separated")}<label class="span">Career Interests<textarea name="careerInterests" rows="3" placeholder="Comma separated">${esc(arr("careerInterests"))}</textarea></label><label class="span">Projects<textarea name="projectsJson" rows="5" placeholder='[{"title":"Campus App","description":"...","technologies":["Java"]}]'>${esc(JSON.stringify(p.projects||[],null,2))}</textarea></label><label class="span">Internships<textarea name="internshipsJson" rows="4" placeholder='[{"company":"ABC","role":"Intern","duration":"2 months","description":"..."}]'>${esc(JSON.stringify(p.internships||[],null,2))}</textarea></label><label class="span">Certifications<textarea name="certificationsJson" rows="4" placeholder='[{"name":"Java","provider":"Oracle","date":"2026-01-01","url":"https://..."}]'>${esc(JSON.stringify(p.certifications||[],null,2))}</textarea></label><div class="span"><button class="btn primary" type="submit">Save Profile to MongoDB</button></div></form></div>`;document.getElementById("profile-form").onsubmit=saveProfile}
async function saveProfile(e){e.preventDefault();const button=e.target.querySelector("button[type=submit]");button.disabled=true;button.textContent="Saving Profile...";const form=new FormData(e.target);const body=Object.fromEntries(form);["programmingLanguages","technicalSkills","softSkills","aiSkills","tools","interestedIndustries","careerInterests"].forEach(k=>body[k]=body[k]?body[k].split(",").map(x=>x.trim()).filter(Boolean):[]);for(const [from,to] of [["projectsJson","projects"],["internshipsJson","internships"],["certificationsJson","certifications"]]){try{body[to]=body[from]?JSON.parse(body[from]):[]}catch{toast(`Invalid ${to} JSON.`,"error");button.disabled=false;button.textContent="Save Profile to MongoDB";return}delete body[from]}try{const data=await api("/api/student/profile",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});state.profile=data.profile;state.user.name=data.profile.fullName||state.user.name;document.getElementById("user-name").textContent=state.user.name;toast("Profile saved to MongoDB ✓");profileView()}catch(e){toast(e.message,"error")}finally{button.disabled=false}}
function resumeView(){const r=state.profile?.resume;title.textContent="Resume";content.innerHTML=`<div class="dashboard-card full-card"><h2 class="section-title">Resume</h2><p class="muted">Stored securely with a MongoDB GridFS reference in your profile.</p>${r?`<div class="list-item"><b>${esc(r.filename)}</b><small>${Math.round((r.size||0)/1024)} KB • Uploaded ${date(r.uploadedAt)}</small><div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"><a class="btn ghost" target="_blank" href="/api/student/resume/${encodeURIComponent(r.fileId)}">View Resume</a><button class="btn ghost" onclick="deleteResume()">Delete Resume</button></div></div>`:'<div class="empty">No resume uploaded yet.</div>'}<form id="resume-form" style="margin-top:18px"><label class="btn ghost" style="display:inline-flex">Choose PDF / DOC / DOCX<input id="resume-file" type="file" accept=".pdf,.doc,.docx" hidden required></label><button class="btn primary" type="submit" style="margin-left:8px">Upload Resume</button></form></div>`;document.getElementById("resume-form").onsubmit=uploadResume}
async function uploadResume(e){e.preventDefault();const file=document.getElementById("resume-file").files[0];if(!file)return;const button=e.target.querySelector("button");button.disabled=true;button.textContent="Uploading...";const form=new FormData();form.append("resume",file);try{const data=await api("/api/student/resume",{method:"POST",body:form});toast(data.message);const p=await api("/api/student/profile");state.profile=p.profile;resumeView()}catch(e){toast(e.message,"error")}finally{button.disabled=false;button.textContent="Upload Resume"}}
async function deleteResume(){try{const d=await api("/api/student/resume",{method:"DELETE"});toast(d.message);const p=await api("/api/student/profile");state.profile=p.profile;resumeView()}catch(e){toast(e.message,"error")}}
function aiSkillsView(){title.textContent="AI Skills";const skills=["Artificial Intelligence","Machine Learning","Generative AI","Prompt Engineering","Data Science","Deep Learning","Computer Vision","NLP","Cloud Computing","Cybersecurity","Full Stack Development","Data Analytics"];content.innerHTML=`<div class="section-heading" style="text-align:left;margin:0 0 20px"><span class="eyebrow">FUTURE READY</span><h2 class="section-title">Build your future skill stack.</h2><p class="muted">Roadmaps aligned with placement-focused skills.</p></div><div class="dashboard-grid">${skills.map((s,i)=>`<div class="dashboard-card"><h3>${s}</h3><span class="pill">${i%3===0?"High Impact":i%3===1?"In Demand":"Emerging"}</span><div class="progress"><i style="width:${35+i*4}%"></i></div><small class="muted">${["Beginner","Intermediate","Advanced"][i%3]} • Roadmap • Projects • Certifications</small></div>`).join("")}</div>`}
async function achievementsView(){await resourceView("achievements","Achievements");const card=content.querySelector(".full-card");if(card)card.insertAdjacentHTML("afterbegin",`<button class="btn primary" onclick="addAchievement()">+ Add Achievement</button><br><br>`)}
async function addAchievement(){const t=prompt("Achievement title");if(!t)return;try{await api("/api/achievements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:t,date:new Date().toISOString(),category:"Student Achievement"})});toast("Achievement added.");achievementsView()}catch(e){toast(e.message,"error")}}
async function applyPlacement(id){try{const d=await api(`/api/placements/${id}/apply`,{method:"POST"});toast(d.message)}catch(e){toast(e.message,"error")}}
async function startTest(id){try{const {data}=await api(`/api/tests`);const test=data.find(x=>x._id===id);if(!test)return;const modal=document.createElement("div");modal.className="modal-backdrop";modal.innerHTML=`<div class="test-modal"><div class="test-head"><div><span class="eyebrow">${esc(test.category)}</span><h2>${esc(test.title)}</h2></div><div class="test-timer" id="test-timer">${String(test.duration).padStart(2,"0")}:00</div></div><div id="test-body"></div><div class="test-actions"><button class="btn ghost" id="prev-q">Previous</button><button class="btn ghost" id="next-q">Next</button><button class="btn primary" id="submit-test">Submit Test</button></div></div>`;document.body.appendChild(modal);const full=await api(`/api/tests?search=${encodeURIComponent(test.title)}`);const questions=full.data.find(x=>x._id===id)?.questions||[];let index=0;const answers={};const body=modal.querySelector("#test-body");function render(){const q=questions[index];body.innerHTML=`<div class="test-progress">Question ${index+1} of ${questions.length}</div><h3>${esc(q.question)}</h3><div class="option-grid">${(q.options||[]).map((o,i)=>`<label class="test-option"><input type="radio" name="answer" value="${i}" ${answers[q._id]===i?"checked":""}> <span>${esc(o)}</span></label>`).join("")}</div>`;body.querySelectorAll("input").forEach(r=>r.onchange=()=>answers[q._id]=Number(r.value));modal.querySelector("#prev-q").disabled=index===0;modal.querySelector("#next-q").disabled=index===questions.length-1}render();modal.querySelector("#prev-q").onclick=()=>{if(index>0){index--;render()}};modal.querySelector("#next-q").onclick=()=>{if(index<questions.length-1){index++;render()}};let seconds=(test.duration||10)*60;const timer=setInterval(()=>{seconds--;const m=Math.floor(seconds/60),s=seconds%60;modal.querySelector("#test-timer").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;if(seconds<=0){clearInterval(timer);submit()}},1000);async function submit(){clearInterval(timer);try{const payload={answers:Object.entries(answers).map(([questionId,selected])=>({questionId,selected}))};const result=await api(`/api/tests/${id}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});modal.remove();toast(`Test submitted: ${result.result.score}/${result.result.total} (${result.result.percentage}%)`);showSection("tests")}catch(e){toast(e.message,"error")}}modal.querySelector("#submit-test").onclick=submit}catch(e){toast(e.message,"error")}}
function settingsView(){
  title.textContent="Settings";
  content.innerHTML=`<div class="dashboard-card full-card"><h2 class="section-title">Account Settings</h2><p class="muted">Your account is protected with an HTTP-only authentication cookie.</p><div class="list-item"><b>${esc(state.user?.name||"Student")}</b><small>${esc(state.user?.email||"")}</small><small>Role: ${esc(state.user?.role||"student")}</small></div><button class="btn ghost" style="margin-top:14px" onclick="showSection('profile')">Update Profile</button></div>`;
}

async function showSection(section){try{if(section==="dashboard")dashboardView();else if(section==="profile")profileView();else if(section==="resume")resumeView();else if(section==="aiSkills")aiSkillsView();else if(section==="achievements")await achievementsView();else if(section==="settings")settingsView();else{const map={placements:["placements","Placements"],companyCalls:["companyCalls","Company Calls"],jobs:["jobs","Job Notifications"],training:["training","Training"],courses:["courses","Courses"],interviews:["interviews","Interviews"],tests:["tests","Online Tests"],hiring:["hiring","Hiring Status"]};const [r,h]=map[section]||["placements","Placements"];await resourceView(r,h)}document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.section===section))}catch(e){toast(e.message,"error");if(e.message.includes("Authentication")||e.message.includes("Session expired"))location.href="/login.html"}}
window.showSection=showSection;window.loadResource=loadResource;window.applyPlacement=applyPlacement;window.startTest=startTest;window.deleteResume=deleteResume;window.addAchievement=addAchievement;
async function init(){try{const data=await api("/api/auth/me");if(data.user.role==="admin"){location.href="/admin.html";return}state.user=data.user;state.profile=data.profile||{};document.getElementById("user-name").textContent=data.user.name;document.getElementById("user-avatar").textContent=(data.user.name||"S")[0].toUpperCase();state.dashboard=await api("/api/dashboard");dashboardView()}catch(e){location.href="/login.html"}}
document.querySelectorAll(".side-link").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.section)));document.getElementById("logout").addEventListener("click",async()=>{await api("/api/auth/logout",{method:"POST"});location.href="/login.html"});document.getElementById("sidebar-toggle").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));init();
