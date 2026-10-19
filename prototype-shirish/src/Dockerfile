# Build context is this folder (src/), because the server also serves ../app/src/lib/avatars.js.
FROM node:20-slim
WORKDIR /srv/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
COPY app/src/lib/avatars.js /srv/app/src/lib/avatars.js

# Fly terminates HTTPS itself, so the server's self-signed :4443 listener is not needed.
# Crews and uploads live on the Fly volume mounted at /data.
ENV PORT=8080 \
    DATA_DIR=/data/crews \
    SUBMISSIONS_DIR=/data/submissions

EXPOSE 8080
CMD ["node", "src/index.js"]
