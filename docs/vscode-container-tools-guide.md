# VS Code Container Tools Guide for This Project

This project is already containerized enough to use the VS Code Docker workflow right away:

- `Dockerfile` builds a Python `3.11-slim` image
- `app.py` starts the Flask server on port `5000`
- there is no `docker-compose.yml` yet, so this is a single-container flow

## 1. Install the right VS Code extension

The old VS Code Docker extension has been replaced by **Container Tools** from Microsoft.

- Extension id: `ms-azuretools.vscode-containers`
- Optional pack: `ms-azuretools.vscode-docker`
- Optional for full dev environments inside a container: `ms-vscode-remote.remote-containers`

## 2. Start Docker Desktop before using the extension

In this workspace, the Docker CLI is installed, but the Docker daemon is not currently running. If VS Code shows no containers or images, start Docker Desktop first and wait for Docker to become ready.

Quick terminal check:

```powershell
docker --version
docker images
```

If `docker images` says it cannot connect to `docker_engine`, Docker Desktop is not started yet.

## 3. Open the real project folder

Open this folder in VS Code, not the virtual environment root:

```text
X:\Projets\M2\ADOMC\projet-min-conflit
```

That folder contains:

- `Dockerfile`
- `requirements.txt`
- `app.py`
- `static/`
- `solvers/`

## 4. Build the image from VS Code

You can use either of these paths:

1. Open the Command Palette with `Ctrl+Shift+P`
2. Run `Containers: Build Image`
3. Pick the `Dockerfile` in this project
4. Use a tag like `min-conflit:local`

Or:

1. Open the **Container Explorer**
2. Right-click the `Dockerfile`
3. Choose the build action

CLI equivalent:

```powershell
docker build -t min-conflit:local .
```

## 5. Run the container from VS Code

After the build finishes:

1. Open **Container Explorer**
2. Expand **Images**
3. Right-click `min-conflit:local`
4. Choose `Run` or `Run Interactive`
5. Map container port `5000` to local port `5000`

CLI equivalent:

```powershell
docker run --rm -p 5000:5000 --name min-conflit-app min-conflit:local
```

Then open:

- `http://localhost:5000/`
- `http://localhost:5000/app`

## 6. Use the Container Explorer after the app is running

Once the container is started, VS Code lets you manage it visually:

- right-click the container to `View Logs`
- `Start`, `Stop`, `Restart`, or `Remove`
- inspect images, volumes, and networks

This is the easiest way to understand what Docker is doing without memorizing commands.

## 7. What each VS Code action means in this project

- **Build Image**: reads `Dockerfile`, installs `flask`, and copies the app into `/app`
- **Run Container**: executes `python app.py`
- **View Logs**: shows Flask startup output and request logs
- **Open in Browser**: lets you test the landing page and solver UI

## 8. If you want one-click container debugging

Container Tools can scaffold debug files for Python projects.

In VS Code:

1. Run `Containers: Add Docker Files to Workspace...`
2. Choose **Python: Flask**
3. Let VS Code add `.vscode/tasks.json` and `.vscode/launch.json`
4. Start with `F5`

This is the official path when you want build, run, and debugger attachment from VS Code instead of using the explorer manually.

Because this repository already has a `Dockerfile`, review any generated files before keeping them.

## 9. If you want to develop entirely inside a container

That is a different workflow from Container Tools.

Use the **Dev Containers** extension when you want:

- VS Code itself attached to the container
- terminals running inside the container
- the toolchain isolated from your host machine

That workflow is driven by a `.devcontainer/devcontainer.json` file.

## 10. Best next step for this repository

Use this order:

1. Start Docker Desktop
2. Install **Container Tools**
3. Build `min-conflit:local`
4. Run the container with port `5000:5000`
5. Open the app in the browser
6. Use `View Logs` in Container Explorer while testing `/solve` and `/solve-sudoku`

## Official references

- VS Code Containers overview: https://code.visualstudio.com/docs/containers/overview
- Container Tools marketplace page: https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers
- Python containers quickstart: https://code.visualstudio.com/docs/containers/quickstart-python
- Dev Containers setup: https://code.visualstudio.com/docs/devcontainers/create-dev-container
