docker build .
tagName=$(docker images | awk '{print $3}' | awk 'NR==2')
docker tag $tagName toadlessss/monkeapi:latest
docker login
docker push toadlessss/monkeapi:latest
echo "Done!"
