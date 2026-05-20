# Docker image on X drive and isolated startup

This repository can be packaged as a Docker image, and started without mounting the project folder into the container.

## What changed

- the Flask app reads `APP_HOST`, `APP_PORT`, and `APP_DEBUG`
- Docker starts the app on `0.0.0.0` for container access
- the image runs as a non-root user
- the container can be launched with a read-only root filesystem
- no project folder is mounted into the container
- a script show the active isolation settings

## 1. Build and export the image to X:

From the project folder:

```powershell
.\scripts\export-docker-image.ps1
```

Default output:

```text
X:\Projets\M2\ADOMC\docker-images\min-conflit-portable.tar
```

The script also writes a SHA256 file next to the archive.

## 2. Start the image in an isolated container

```powershell
.\scripts\run-isolated-container.ps1
```

The container is started with:

- `--read-only`
- `--tmpfs /tmp`
- `--cap-drop ALL`
- `--security-opt no-new-privileges`
- no bind mount / no volume mount for the project source

Open the app from the host machine in:

```text
http://127.0.0.1:5000/
```

The browser stays on the host machine. The container only serves HTTP on port `5000`.

## 3. Show proof that the container is isolated

Leave the container running, then open another terminal in the project and run:

```powershell
.\scripts\show-isolation-proof.ps1
```

The report shows:

- `mount_count = 0`
- `read_only_rootfs = True`
- dropped Linux capabilities
- whether a known browser binary exists in the container

## 4. Load the same image on another machine

If the tar archive is already on `X:`, the target machine can load it with:

```powershell
docker load --input "X:\Projets\M2\ADOMC\docker-images\min-conflit-portable.tar"
```

Then start it with:

```powershell
.\scripts\run-isolated-container.ps1
```

## Notes

- if Docker Desktop is not running, `docker build`, `docker save`, `docker load`, and `docker run` will fail
- the current workspace already showed that the Docker daemon is not started yet
- because there is no bind mount, the container cannot change your project files on `X:`
