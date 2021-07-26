#!/usr/bin/env bash

INSTANCE_ID=`aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[] | contains(@, 'ishetalpayday.nl')].Id" --output text`
aws cloudfront create-invalidation --distribution-id $INSTANCE_ID --paths "/*"
