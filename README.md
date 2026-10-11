# RE:LIFE: AI-Powered Second-Life Platform for Electronics

> Repair, reuse, donate or resell first. Recycle only when a device's useful life is truly over.

RE:LIFE helps people decide what to do with an old, damaged, slow or unwanted electronic device. Instead of pushing everything to recycling, it recommends the best next step, makes transfers safer with a data-safety checklist, and produces a verification report that builds trust in second-hand devices.

**Demo video:** [YouTube link]
**Live app (if hosted):** [URL]

---

## The Problem

- People keep old phones, laptops and tablets unused because they don't know whether to repair, sell, donate or recycle them.
- Devices with minor faults (for example, a weak battery) are discarded even though repair would extend their life.
- Buyers distrust second-hand devices because condition, repair history and data-safety claims are hard to verify.
- Owners avoid selling or donating because their personal data may still be on the device.

E-waste is not only a recycling problem. It is also a **premature end-of-life** problem.

## Our Solution

RE:LIFE guides a device through a circular sequence:

**continue using → repair → reuse → donate/sell → repurpose → recover components → recycle**

1. **Assess** the device (category, model, age, condition, faults, repair history).
2. **Recommend** the best next-life pathway with AI.
3. **Compare** repair vs replace using cost and expected remaining life.
4. **Guide** the user through a data-safety checklist before transfer.
5. **Generate** a shareable verification report with a unique ID.
6. **Connect** the user to resale, donation, repair or recycling channels.
7. **Record** lifecycle events in a device timeline.

## Features (MVP)

| Feature | Description |
|---|---|
| Device assessment | Form-based registration of device details and known issues |
| Next-life recommendation | Rule-based logic plus ChatGPT API for recommendation and explanation |
| Repair vs replace | Simple repair-cost and remaining-life comparison |
| Data-safety checklist | Backup, account removal, encryption, factory reset, storage sanitization |
| Verification report | Report page with unique verification ID, condition, repair history and checks |
| Resale handoff | Links and a generated listing description for existing resale channels |
| Lifecycle timeline | Registered, repaired, transferred, recycled |
| Impact dashboard | Counts of devices repaired, reused, donated and recycled |

> Update this table to match exactly what is working in your build.

## Honest Verification Labels

A browser cannot prove that storage has been securely erased or inspect every OS property. RE:LIFE therefore labels each check as:

- **User Verified**: confirmed by the user through a guided checklist
- **System Verified**: confirmed by the system where technically possible
- **Not Verified**: not checked

The verification report reflects checks recorded on the verification date. It is a project-generated report, not an endorsement by any marketplace, manufacturer or recycler, and not a guarantee of future performance.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React / Vite |
| Backend | Node.js + Express |
| Database | MongoDB |
| AI | ChatGPT (OpenAI) API for recommendations and explanations |
| Cloud | AWS (see below) |

## AWS Services Used

| AWS service | How we use it |
|---|---|
| [e.g., EC2 / Elastic Beanstalk / Amplify] | [Hosting the app] |
| [e.g., S3] | [Storing uploaded device images / generated reports] |
| [e.g., Lambda] | [Report generation or other serverless tasks] |

> Replace the rows above with the AWS services you actually use, and delete any you don't.

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or Atlas)
- An OpenAI API key

### Installation

```bash
git clone https://github.com/sanscode23/Relife.git
cd Relife

# install dependencies
cd server && npm install
cd ../client && npm install
```

### Environment variables

Create a `.env` file in the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

Never commit your `.env` file or API keys.

### Run locally

```bash
# terminal 1: backend
cd server && npm start

# terminal 2: frontend
cd client && npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).


## Project Structure

```
[repo-folder]/
├── client/    # React / Vite frontend
├── server/    # Node.js + Express API, MongoDB models
└── README.md
```

## Example Journey

A 4-year-old laptop is registered. Screen and performance are good, but the battery is weak. RE:LIFE recommends repair over discarding. After the battery is replaced, the owner completes the data-safety checklist and receives a verification report with a unique ID, then lists the laptop on an existing resale platform. When the laptop eventually reaches end-of-life, it is routed to responsible recycling and the final event is recorded.

## Impact Metrics

Devices assessed, devices repaired instead of discarded, devices reused/donated/resold, devices sent to responsible recycling, and estimated additional useful-life years.

## Future Scope

- Technician-verified certification through partner repair shops
- AI image-based condition assessment
- Pickup and recycler integration
- Marketplace API so resale platforms can show verification status
- Desktop utility for deeper OS-level transfer-readiness checks
- Component-level recovery recommendations
- College and corporate e-waste dashboards
- Public lifecycle API for verified device history

## AI Tools Disclosure

- ChatGPT API powers the in-app recommendations.
- AI coding tools used during development: [list tools, or write "none"].

## Team

1.sanskar wankhede
2.khushi sarda
3.janhavi patil
4.shreya sarvate 

## License

MIT
