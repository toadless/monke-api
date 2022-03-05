docker build .
tagName=$(docker images | awk '{print $3}' | awk 'NR==2')
docker tag $tagName frogg1t/monkeapi:latest
docker login
docker push frogg1t/monkeapi:latest
echo "Done!"
