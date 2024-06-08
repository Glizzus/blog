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
