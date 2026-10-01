import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TicketEmailProps {
  firstName: string;
  lastName: string;
  referenceId: string;
  ticketUrl: string;
  qrCodeDataUri: string;
}

export const TicketEmail = ({
  firstName = "Explorer",
  lastName = "",
  referenceId = "UNKNOWN",
  ticketUrl = "https://mainquesthq.com",
  qrCodeDataUri = "",
}: TicketEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your ticket to MainQuest is here.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>MainQuest</Heading>
          <Text style={text}>Hello. {firstName},</Text>
          <Text style={text}>
            Thank you for registering for MainQuest; Against All Odds, We can’t wait to journey with you on this quest together. 
          </Text>
          <Section style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
            <Img src="cid:ticket" width="400" height="650" alt="MainQuest Ticket" style={{ margin: "0 auto", border: "1px solid #e0e0e0" }} />
          </Section>
          <Text style={text}>
            This is also your cue to share with friends so they can join the quest.
          </Text>
          <Text style={text}>See you soon!</Text>
          <Text style={text}>
            You can view your ticket at any time using this link:<br />
            <a href={ticketUrl} style={link}>{ticketUrl}</a>
          </Text>
          <Text style={footer}>
            MainQuest • Find your direction. Make your move.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f1ecd8",
  fontFamily: 'Arial, "Helvetica Neue", sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "2px solid #000000",
  boxShadow: "6px 6px 0px #fb1422",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "600px",
};

const h1 = {
  color: "#000000",
  fontSize: "24px",
  fontWeight: "900",
  letterSpacing: "-0.05em",
  margin: "0 0 20px 0",
};

const text = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const ticketCard = {
  backgroundColor: "#fedd55",
  border: "2px solid #000000",
  boxShadow: "4px 4px 0px #000000",
  padding: "20px",
  marginBottom: "30px",
};

const kicker = {
  fontSize: "12px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  margin: "0 0 10px 0",
  borderBottom: "1px solid #000",
  paddingBottom: "5px",
};

const h2 = {
  fontSize: "24px",
  margin: "0 0 5px 0",
  lineHeight: "1.1",
};

const refId = {
  fontSize: "12px",
  fontWeight: "900",
  margin: "0",
};

const hr = {
  borderColor: "#000000",
  borderStyle: "dashed",
  margin: "20px 0",
};

const info = {
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const link = {
  color: "#fb1422",
  fontWeight: "bold",
  textDecoration: "underline",
};

const footer = {
  fontSize: "12px",
  color: "#555555",
  marginTop: "40px",
  textAlign: "center" as const,
};
