import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedSecretBoard = await deploy("SecretBoard", {
    from: deployer,
    log: true,
  });

  console.log(`SecretBoard contract: `, deployedSecretBoard.address);
};
export default func;
func.id = "deploy_secretBoard"; // id required to prevent reexecution
func.tags = ["SecretBoard"];
