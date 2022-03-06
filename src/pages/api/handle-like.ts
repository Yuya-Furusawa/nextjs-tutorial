import type { NextApiRequest, NextApiResponse } from "next";
import { sanityClient } from "../../../lib/sanity";

sanityClient.config({
  token: process.env.SANITY_WRITE_TOKEN,
});

const likeButtonHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { _id } = JSON.parse(req.body);
  const data = await sanityClient
    .patch(_id)
    .setIfMissing({ likes: 0 })
    .inc({ likes: 1 })
    .commit();

  res.status(200).json({ likes: data.likes });
}

export default likeButtonHandler;
