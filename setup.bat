rmdir /S /Q shiproute
cmd /c npx -y create-next-app@latest shiproute --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm --skip-install --yes
xcopy shiproute . /E /H /C /I /Y
rmdir /S /Q shiproute
