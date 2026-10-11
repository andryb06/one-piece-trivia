const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

function renderRepositories(repositories) {
  repositoryList.replaceChildren();

  for (const repository of repositories) {
    const item = document.createElement("li");
    const card = document.createElement("article");
    const name = document.createElement("h3");
    const link = document.createElement("a");
    const description = document.createElement("p");
    const metadata = document.createElement("div");
    const fullName = document.createElement("span");
    const starredDate = document.createElement("time");

    card.className = "repository-card";
    name.className = "repository-name";
    link.href = repository.html_url;
    link.textContent = repository.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    description.className = "repository-description";
    description.textContent = repository.description || "No description provided.";
    metadata.className = "repository-meta";
    fullName.textContent = repository.full_name;
    starredDate.dateTime = repository.starred_at;
    starredDate.textContent = `Starred ${new Date(`${repository.starred_at}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;

    name.append(link);
    metadata.append(fullName, starredDate);
    card.append(name, description, metadata);
    item.append(card);
    repositoryList.append(item);
  }

  listStatus.textContent = repositories.length
    ? `${repositories.length} repositories`
    : "No starred repositories to show.";
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a JSON array.");
    }

    renderRepositories(repositories);
  } catch (error) {
    console.error("Could not load starred repositories.", error);
    listStatus.textContent = "Could not load repositories. Please try again later.";
  }
}

loadRepositories();
