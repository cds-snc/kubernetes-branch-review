FROM node:alpine

WORKDIR /app
ADD . .

ENV NODE_ENV production
ENV PORT 3000

RUN yarn install
USER node

EXPOSE 3000

CMD yarn start
