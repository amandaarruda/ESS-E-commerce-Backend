#!/bin/bash

# Export environment variables
export AT_SECRET=${{ secrets.AT_SECRET }}
export AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
export AWS_REGION=${{ secrets.AWS_REGION }}
export AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
export DATABASE_URL=${{ secrets.DATABASE_URL }}
export ECR_REPOSITORY=${{ secrets.ECR_REPOSITORY }}
export EMAIL_OPTIONS_FROM=${{ secrets.EMAIL_OPTIONS_FROM }}
export LIGHTSAIL_SERVICE_NAME=${{ secrets.LIGHTSAIL_SERVICE_NAME }}
export RT_SECRET=${{ secrets.RT_SECRET }}
export SENDGRID_API_KEY=${{ secrets.SENDGRID_API_KEY }}
export TK_EMAIL_SECRET=${{ secrets.TK_EMAIL_SECRET }}

export API_CORREIOS_URL=${{ vars.API_CORREIOS_URL }}
export APP_PORT=${{ vars.APP_PORT }}
export ENV=${{ vars.ENV }}
export FRONTEND_RECOVER_PASSWORD_URL=${{ vars.FRONTEND_RECOVER_PASSWORD_URL }}
export FRONT_END_URL=${{ vars.FRONT_END_URL }}
export IMAGE_TAG=${{ vars.IMAGE_TAG }}
export JWT_ACCESS_LIFETIME=${{ vars.JWT_ACCESS_LIFETIME }}
export JWT_REFRESH_LIFETIME=${{ vars.JWT_REFRESH_LIFETIME }}
export TK_EMAIL_LIFETIME=${{ vars.TK_EMAIL_LIFETIME }}

escape_sed() {
    echo "$1" | sed -e 's/[\/&]/\\&/g'
}

KEYS=(
    "AT_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_REGION"
    "AWS_SECRET_ACCESS_KEY"
    "DATABASE_URL"
    "ECR_REPOSITORY"
    "EMAIL_OPTIONS_FROM"
    "LIGHTSAIL_SERVICE_NAME"
    "RT_SECRET"
    "SENDGRID_API_KEY"
    "TK_EMAIL_SECRET"
    "API_CORREIOS_URL"
    "APP_PORT"
    "ENV"
    "FRONTEND_RECOVER_PASSWORD_URL"
    "FRONT_END_URL"
    "IMAGE_TAG"
    "JWT_ACCESS_LIFETIME"
    "JWT_REFRESH_LIFETIME"
    "TK_EMAIL_LIFETIME"
)

for KEY in "${KEYS[@]}"; do
    VALUE=$(escape_sed "${!KEY}")
    echo "Substituindo $KEY por $VALUE no $CONFIG_FILE"
    
    awk -v key="$KEY" -v value="$VALUE" '{ gsub(key, value); print }' $CONFIG_FILE > temp.json && mv temp.json $CONFIG_FILE
done
