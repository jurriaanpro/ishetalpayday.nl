import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53 from '@aws-cdk/aws-route53';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';
import * as targets from '@aws-cdk/aws-route53-targets';

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: 'ishetalpayday.nl',
      websiteIndexDocument: 'index.html'
    });

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z01149682CINTR40LQO8P',
      zoneName: 'ishetalpayday.nl'
    });

    const certificate = new certificateManager.DnsValidatedCertificate(this, 'Certificate', {
      domainName: 'ishetalpayday.nl',
      subjectAlternativeNames: ['www.ishetalpayday.nl'],
      hostedZone,
      region: 'us-east-1'
    });

    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'OAI');

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: cloudFrontOAI,
          },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ], viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate, // 1
          {
            aliases: ['ishetalpayday.nl', 'www.ishetalpayday.nl'],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
            sslMethod: cloudfront.SSLMethod.SNI,
          },
      ),
    })

    new route53.ARecord(this, 'Alias', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    bucket.grantRead(cloudFrontOAI.grantPrincipal);
  }
}
