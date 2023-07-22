FROM node:16-alpine as build-stage

WORKDIR /web

COPY .npmrc package.json yarn.lock ./
RUN --mount=type=cache,id=yarn-store,target=/root/.yarn-store \
    yarn install --frozen-lockfile

COPY . .
ARG NODE_ENV=""
ENV NODE_ENV ${NODE_ENV}
RUN  yarn build:prod
#RUN env ${NODE_ENV} yarn build:prod

## -- stage: dist => nginx --
FROM nginx:alpine

ENV TZ=Asia/Shanghai

#ENV WORKDIR /home/eap/eap-admin
ENV WORKDIR /usr/share/nginx/html

COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /web/dist ${WORKDIR}

EXPOSE 80
