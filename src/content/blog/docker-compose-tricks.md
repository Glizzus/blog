---
title: Quick and Dirty Docker Compose with Configs
description: Configs are an underrated feature of Docker Compose, especially for simpler setups.
pubDate: 2024-06-07
---

## Introduction

When working with Docker, you may initially begin by copying source code into
a container, building it, and running the container.
For example, this is one of the simplest Node.js Dockerfiles.

```dockerfile
FROM node:22.2-alpine3.20

WORKDIR /app
COPY package.json package-lock.json .
RUN npm install

COPY src ./src
RUN npm run build

ENTRYPOINT ["node", "/app/dist/index.js"]
```

You will also use Docker to provision services, and then start using
Docker Compose to make it easier.
For example, this is a `docker-compose.yml` that provisions Redis.

```yaml
services:
  redis:
    image: redis:7.2.5-alpine3.20
    container_name: redis
    ports:
      - '6379:6379'
    volumes:
      - ./redis/data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
```

Eventually, you will start firing up quick and dirty docker containers for one off tasks.
You may want a quick Squid forward proxy, or you will want to launch a container
to try out an application.
You may also launch a container whose entire purpose is to configure another container,
and then exit.

For example, there is an LLM platform called Ollama whose entrypoint is to run a server.
The container runs with `ollama serve`.

```sh
ollama serve # Serve the Ollama HTTP server on the default port 11434
```

You can get an LLM model with the command `ollama pull`, which allows you to run LLM queries.
The issue is, this command requires a server to point to.

```sh
export OLLAMA_HOST="ollama.example.com"
ollama pull llama3 # Pull the llama3 model from Ollama hub, and store it on ollama.example.com
ollama run llama3 "What came first: the chicken or the egg?"
```

The issue with provisioning Ollama in Docker, however, is that Docker is primarily designed
to run one process at once.
You can't run `ollama pull` initially because there is no Ollama server running from
`ollama serve`, and if you run `ollama serve` as your entrypoint command, then you can't run
`ollama pull`.
There are two main ways around this:

1. Add an `entrypoint.sh` script that uses Bash job control:

    ```bash
    #!/bin/bash
    set -e

    ollama serve & # Send the server to the foreground
    ollama pull llama3
    ollama run llama3 "What came first: the chicken or the egg?"
    ```

2. Have a second container that provisions the main container:

    ```yaml
    services:
      # This is the main server container, and runs forever
      ollama:
        image: ollama/ollama:0.1.43
        volumes:
          - ./ollama/data:/root/.ollama
        entrypoint: ['ollama', 'serve']

      # This container only executes the pull command above
      # the server, then exits.
      model-creator:
        image: ollama/ollama:0.1.43
        environment:
          OLLAMA_HOST: ollama
        entrypoint: ['ollama', 'pull', 'llama3']
        depends_on:
          - ollama
    ```

## Code vs. Configuration

There is a long-running debate about how configuration should be treated
in Docker. With code, it is simple - copy it into the Dockerfile and build it.
What about configuration?

For example, let's revisit the above example of Ollama with `entrypoint.sh`.

```bash
#!/bin/bash
set -e

ollama serve & # Send the server to the foreground
ollama pull llama3
ollama run llama3 "What came first: the chicken or the egg?"
```

There are two ways we can actually use this script:

1. Bake it into the Docker image

    ```dockerfile
    FROM ollama/ollama:0.1.43
    COPY entrypoint.sh /entrypoint.sh

    ENTRYPOINT ['/entrypoint.sh']
    ```

    ```bash
    docker build . --tag=myregistry/ollama:latest
    docker push myregistry/ollama:latest
    ```

2. Mount the script as a volume

    