FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_LAB_GUEST_URL=/guest
ARG VITE_LAB_ADMIN_URL=/admin
ENV VITE_LAB_GUEST_URL=${VITE_LAB_GUEST_URL}
ENV VITE_LAB_ADMIN_URL=${VITE_LAB_ADMIN_URL}

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist /app/dist

EXPOSE 5000

CMD ["node", "dist/index.cjs"]
