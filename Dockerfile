FROM node

COPY . .

RUN npm install

EXPOSE 3012

CMD ["npm", "run", "devStart"]